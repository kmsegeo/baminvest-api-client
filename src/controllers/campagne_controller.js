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
                        await CampagneReponse.findAllByLineColumn(question.r_i).then(async reponses => {
                            // if (question.r_avec_colonne==1) {       // Matrice
                            // await CampagneRepMatrice.findAllByQuestion(question.r_i).then(async matrices => {
                                // for (let matrice of matrices) {
                                // }
                            // } else {                                // Reponses simple
                            // }
                            // }).catch(err => next(err));
                            question['proposition_reponses'] = reponses;
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
    const acteur_id = req.session.e_acteur;
    Utils.expectedParameters({question_ref, reponse_ref}).then(async () => {
        await CampagneQuestion.findByRef(question_ref).then(async question => {
            await CampagneReponse.findAllByLineColumn(question.r_i).then(async suggestions => {
                let reponse = undefined
                for (let suggestion of suggestions)
                    if (suggestion.r_reference==reponse_ref) {
                        reponse=suggestion;
                    }
                if (!reponse) return response(res, 400, `La reponse ne correspond pas à la question !`);
                await ProfilRisqueReponse.findByQuestionId(acteur_id, question.r_i).then(async exists => {
                    if (!exists) {     // Si la question est pas deja repondu
                        await ProfilRisqueReponse.create(reponse.r_points, acteur_id, {question_id: question.r_i, reponse_id: reponse.r_i}).catch(err => next(err));
                    } else {            // Sinon
                        await ProfilRisqueReponse.update(reponse.r_points, acteur_id, {question_id: question.r_i, reponse_id: reponse.r_i}).catch(err => next(err));
                    }
                    return response(res, 200, 'Réponse enregistré avec succès', reponse);
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => response(res, 400, err));
}

const recapProfilRisqueResponses = async (req, res, next) => {
    
    const code = 'CAMP-001';        // A dynamiser

    await ProfilRisqueReponse.findAllByActeur(req.session.e_acteur).then(async reponses => {

        let point_total = 0;
        let profil_investisseur = null;
        let i = 0;

        for (let reponse of reponses) {
            await CampagneQuestion.findById(reponse.e_risques_questions).then(async question => {
                await CampagnePartie.findById(question.e_profil_partie).then(async partie => {
                    await Campagne.findById(partie.e_campagne).then(async campagne => {
                        if (campagne.r_code==code) {
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
            }).catch(err => next(err));
            i+=1;
        }
        profil_investisseur = await Utils.calculProflInvestisseur(point_total);
        return response(res, 200, `Reponses de l'acteur`, reponses, { point_total, profil_investisseur });
    }).catch(err => next(err));
}

const buildProfilRisqueResponses = async (req, res, next) => {
       
    const code = 'CAMP-001';        // A dynamiser
    const acteur_id = req.session.e_acteur;
    
    await ProfilRisqueReponse.findAllByActeur(req.session.e_acteur).then(async reponses => {
        let point_total = 0;
        let profil_investisseur = null;
        for (let reponse of reponses) {
            await CampagneQuestion.findById(reponse.e_risques_questions).then(async question => {
                await CampagnePartie.findById(question.e_profil_partie).then(async partie => {
                    await Campagne.findById(partie.e_campagne).then(async campagne => {
                        if (campagne.r_code==code) {
                            point_total += Number(reponse.r_points);
                        }  
                    }).catch(err => next(err));
                }).catch(err => next(err));
            }).catch(err => next(err));
        }
        profil_investisseur = await Utils.calculProflInvestisseur(profil_investisseur);
        await Acteur.updateProfilInvestisseur(acteur_id, profil_investisseur).catch(err => next(err));
        return response(res, 200, `Profil investisseur de l'acteur définit`, { point_total, profil_investisseur });
    }).catch(err => next(err));
}

module.exports = {
    getAllCampagnes,
    getCampagne,
    getProfilRisqueQuestions,
    saveResponse,
    recapProfilRisqueResponses,
    buildProfilRisqueResponses
}