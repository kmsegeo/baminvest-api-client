const response = require('../middlewares/response');
const Acteur = require('../models/Acteur');
const Campagne = require('../models/Campagne');
const CampagnePartie = require('../models/CampagnePartie');
const CampagneQuestion = require('../models/CampagneQuestion');
const CampagneRepMatrice = require('../models/CampagneRepMatrice')
const CampagneReponse = require('../models/CampagneReponse');
const ProfilRisqueReponse = require('../models/ProfilRisqueReponse');
const Utils = require('../utils/utils.methods');

const periodicite = ['Indeterminée', 'Limitée'];
const cible = ['Particulier', 'Entreprise', 'Les deux'];
const matrice_type = ['Ligne', 'Colonne'];

const getAllCampagnes = async (req, res, next) => {
    console.log(`Chargement de la liste de campagne..`)
    await Campagne.findAll()
        .then(async results => {
            if (results) {
                for(let result of results) {
                    await Acteur.findById(result.e_acteur).then(acteur => {
                        result['acteur'] = acteur;
                        delete result.e_acteur;
                    }).catch(err => next(err));
                    result['periodicite_intitule'] = periodicite[result.r_periodicite];
                    result['cible_intitule'] = cible[result.r_cible];
                }
            }
            return response(res, 200, `Chargement terminé`, results)
        }).catch(err => next(err));
}

const getCampagne = async (req, res, next) => {
    console.log(`Chargement de campagne par code..`)
    const code = req.params.code;
    await Campagne.findByCode(code).then(async result => {
        if (!result) return response(res, 404, `Campagne ${code} non trouvé !`, result)
        await Acteur.findById(result.e_acteur).then(acteur => {
            result['acteur'] = acteur;
            delete result.e_acteur;
        }).catch(err => next(err));
        if (!result) return response(res, 400, `Une erreur s'est produite`)
            result['periodicite_intitule'] = periodicite[result.r_periodicite];
            result['cible_intitule'] = cible[result.r_cible];
        return response(res, 200, `Chargement de campagne ${code}`, result)
    }).catch(err => next(err));
}

const getProfilRisqueQuestions = async (req, res, next) => {

    const code = 'CAMP-001';        // A dynamiser

    console.log(`Chargement de campagne par code..`)
    await Campagne.findByCode(code).then(async campagne => {
        if (!campagne) return response(res, 404, `Campagne ${code} non trouvé !`, campagne)
        console.log(`Chargement des parties de la campagne`)
        await CampagnePartie.findAllByCampgagne(campagne.r_i).then(async parties => {
            console.log(`Charger les question de chaque parties`);
            for(let partie of parties) {
                await CampagneQuestion.findAllByPartie(partie.r_i).then(async questions => {
                    for (let question of questions) {
                        await CampagneRepMatrice.findAllByQuestion(question.r_i).then(async matrices => {
                            for(let matrice of matrices) {
                                await CampagneReponse.findAllByLineColumn(matrice.r_i).then(async reponses => {
                                    if (question.r_avec_colonne==1) {       // Matrice
                                        console.log(matrice.r_type)
                                        if (matrice.r_type==1) {
                                            matrice.r_type='colonnes' 
                                            matrice['proposition_reponses'] = reponses;
                                        } else {
                                            matrice.r_type='lignes' 
                                            matrice['proposition_reponses'] = reponses;
                                        }
                                        question['matrice'] = matrices
                                    } else {                                // Reponses simple
                                        question['proposition_reponses'] = reponses;
                                    }
                                }).catch(err => next(err));
                            }
                        }).catch(err => next(err));
                    }
                    partie['questions'] = questions;
                }).catch(err => next(err));
            }
            return response(res, 200, `Chargement des questionnaires ${campagne.r_code}`, parties);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const saveResponse = async (req, res, next) => {
    const {question_ref, reponse_ref} = req.body;
    const particulier_id = req.params.particulierId;
    Utils.expectedParameters({question_ref, reponse_ref}).then(async () => {
        await CampagneQuestion.findByRef(question_ref).then(async question => {
            await CampagneReponse.findAllByLineColumn(question.r_i).then(async suggestions => {
                let reponse = undefined
                for (let suggestion of suggestions)
                    if (suggestion.r_reference==reponse_ref) {
                        reponse=suggestion;
                    }
                if (!reponse) return response(res, 400, `La reponse ne correspond pas à la question !`);
                await Acteur.findByParticulierId(particulier_id).then(async acteur => {
                    await ProfilRisqueReponse.findByQuestionId(acteur.r_i, question.r_i).then(async exists => {
                        if (!exists) {     // Si la question est pas deja repondu
                            await ProfilRisqueReponse.create(reponse.r_points, acteur.r_i, {question_id: question.r_i, reponse_id: reponse.r_i}).catch(err => next(err));
                        } else {            // Sinon
                            await ProfilRisqueReponse.update(reponse.r_points, acteur.r_i, {question_id: question.r_i, reponse_id: reponse.r_i}).catch(err => next(err));
                        }
                        return response(res, 200, 'Réponse enregistré avec succès', reponse);
                    }).catch(err => next(err));
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => response(res, 400, err));
}

const recapProfilRisqueResponses = async (req, res, next) => {
    
    const particulier_id = req.params.particulierId;

    await Campagne.findByintitule('profil_risque').then(async campagne => {

        await Acteur.findByParticulierId(particulier_id).then(async acteur => {
            await ProfilRisqueReponse.findAllByActeur(acteur.r_i).then(async reponses => {

                let point_total = 0;
                let profil_investisseur = null;
                let i = 0;

                for (let reponse of reponses) {
                    await CampagneQuestion.findById(reponse.e_risques_questions).then(async question => {
                        await CampagnePartie.findById(question.e_profil_partie).then(async partie => {
                            if (!campagne || partie.e_campagne==campagne.r_i) {
                                point_total += Number(reponse.r_points);
                                reponse['question'] = question
                                await CampagneReponse.findById(reponse.e_risque_reponse).then(async suggestion => {
                                    reponse['reponse'] = suggestion
                                }).catch(err => next(err));
                                delete reponse.e_risque_reponse
                                delete reponse.e_risques_questions
                            } else {
                                delete reponses[i];
                            }
                        }).catch(err => next(err));
                    }).catch(err => next(err));
                    i+=1;
                }
                
                profil_investisseur = await Utils.calculProflInvestisseur(point_total);    
                return response(res, 200, `Reponses de l'acteur`, reponses, profil_investisseur);
                
            }).catch(err => next(err));
        }).catch(err => next(err));

    }).catch(err => next(err));
}

const saveAllResponses = async (req, res, next) => {
    
    const particulier_id = req.params.particulierId;

    await Acteur.findByParticulierId(particulier_id).then(async acteur => {
        if (!acteur) return response(res, 400, `Acteur non trouvé !`);
        
        await ProfilRisqueReponse.cleanActeurReponse(acteur.r_i).then(async () => {

            for (let pr of req.body) {

                const question_ref = pr.question_ref;
                const reponse_ref = pr.reponse_ref;

                await Utils.expectedParameters({question_ref, reponse_ref}).then(async () => {
                    await CampagneQuestion.findByRef(question_ref).then(async question => {
                        await CampagneRepMatrice.findAllByQuestion(question.r_i).then(async matrices => {
                            for (let matrice of matrices) {
                                await CampagneReponse.findAllByLineColumn(matrice.r_i).then(async suggestions => {
                                    let reponse = null;
                                    for (let suggestion of suggestions)
                                        if (suggestion.r_reference==reponse_ref) reponse=suggestion;
                                    if (reponse)
                                        await ProfilRisqueReponse.create(reponse.r_points, acteur.r_i, {question_id: question.r_i, reponse_id: reponse.r_i}).catch(err => next(err));
                                }).catch(err => next(err));
                            }
                        }).catch(err => next(err));
                    }).catch(err => next(err));
                }).catch(err => response(res, 400, err));
                await Utils.sleep(1000);
            }

        }).catch(err => next(err));
    }).catch(err => next(err));

    await buildProfilRisqueResponses(req, res, next);
}

const buildProfilRisqueResponses = async (req, res, next) => {
       
    const particulier_id = req.params.particulierId;

    await Campagne.findByintitule('profil_risque').then(async campagne => {

        await Acteur.findByParticulierId(particulier_id).then(async acteur => {
            await ProfilRisqueReponse.findAllByActeur(acteur.r_i).then(async reponses => {

                let point_total = 0;
                let investisseur = null;
                let i = 0;

                for (let reponse of reponses) {
                    await CampagneQuestion.findById(reponse.e_risques_questions).then(async question => {
                        await CampagnePartie.findById(question.e_profil_partie).then(async partie => {
                            if (!campagne || partie.e_campagne==campagne.r_i) {
                                point_total += Number(reponse.r_points);
                                reponse['question'] = question
                                await CampagneReponse.findById(reponse.e_risque_reponse).then(async suggestion => {
                                    reponse['reponse'] = suggestion
                                }).catch(err => next(err));
                                delete reponse.e_risque_reponse
                                delete reponse.e_risques_questions
                            } else {
                                delete reponses[i];
                            }
                        }).catch(err => next(err));
                    }).catch(err => next(err));
                    i+=1;
                }
                
                investisseur = await Utils.calculProflInvestisseur(point_total);
                await Acteur.updateProfilInvestisseur(acteur.r_i, investisseur.profil_investisseur).catch(err => next(err));
    
                return response(res, 200, `Reponses de l'acteur`, reponses, investisseur);

            }).catch(err => next(err));
        }).catch(err => next(err));

    }).catch(err => next(err));

}

module.exports = {
    getAllCampagnes,
    getCampagne,
    getProfilRisqueQuestions,
    saveResponse,
    recapProfilRisqueResponses,
    saveAllResponses,
    buildProfilRisqueResponses
}