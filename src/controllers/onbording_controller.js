const response = require('../middlewares/response');
const Utils = require('../utils/utils.methods');
const Client = require('../models/Client');
const Acteur = require('../models/Acteur');
const TypeActeur = require('../models/TypeActeur');
const bcrypt = require('bcryptjs');
const Representant = require('../models/Representant');
const Document = require('../models/Document');
const TypeDocument = require('../models/TypeDocument');
const PersonEmergency = require('../models/PersonEmergency');
const OTP = require('../models/OTP');
const KYC = require('../models/KYC');
const uuid = require('uuid');
const ProfilRisqueReponse = require('../models/ProfilRisqueReponse');
const CampagneQuestion = require('../models/CampagneQuestion');
const CampagneRepMatrice = require('../models/CampagneRepMatrice');
const CampagneReponse = require('../models/CampagneReponse');
const CampagnePartie = require('../models/CampagnePartie');
const Campagne = require('../models/Campagne');
const DataFormat = require('../utils/DataFormat.methods');
const Atsgo = require('../utils/atsgo.methods');

const onbordingParticulier = async (req, res, next) => {

    console.log(`Création d'un compte particulier..`);

    const {
        civilite, nom, nom_jeune_fille, prenom, date_naissance, nationalite, email, telephone, adresse, type_piece, num_piece, piece_validite,
        type_compte, langue, autres_contexte_ouv, contexte_ouverture_compte, raisons_ouverture_compte, ouverture_compte, lien_parente_sgo, 
        nom_prenom_titulaire, pays_naissance, pays_residence, situation_matrimoniale, situation_habitat, categorie_professionnelle, 
        autres_categorie_prof, profession, employeur, nbr_enfants, langue_preferee, instrument_paiement_privilige, origine_ressources_investies, 
        autres_origines_ressources, tranche_revenus, autres_actifs, autres_actifs_preciser, autres_comptes_bridge, comptes_bridges, banques_relations,
        activites_politiques, preciser_activite_politiq, proche_politicien, preciser_proche_politicien, contact_nom_prenom, contact_telephone_mobile,
        contact_telephone_fixe, contact_intitule, contact_email, profil_reponses, categorie_fatca, categorie_client, categorie_compte, 
        type_compte_investissement,
    } = req.body;

    console.log(`Vérification des paramètres`);
    await Utils.expectedParameters({civilite, nom, prenom, date_naissance, email, telephone, type_piece, num_piece, piece_validite, type_compte, profession, profil_reponses}).then(async () => {
        
        console.log(`Vérification de l'existance du compte`);
        await Acteur.findByEmail(email).then(async exists_email => {
            if (exists_email) return response(res, 409, `Cette adresse email existe déjà !`);
            
        await Acteur.findByTelephone(telephone).then(async exists_phone => {
            if (exists_phone) return response(res, 409, `Ce numéro de téléphone existe déjà !`);
    
        console.log(`Récupération de l'id du type acteur`);
        await TypeActeur.findByCode("TYAC-003").then(async type_acteur => {
            if (!type_acteur) return response(res, 400, `Problème survenu lors de la determination du type acteur`);
            console.log(`Création du profil particulier`);
            await Client.Particulier.create({
                civilite, 
                nom, 
                nom_jeune_fille, 
                prenom, 
                date_naissance, 
                nationalite, 
                type_piece, 
                num_piece, 
                piece_validite,
                categorie_fatca, 
                categorie_client, 
                categorie_compte,
                type_compte_investissement,
                type_compte
            }).then(async particulier => {
                if (!particulier) return response(res, 400, `Une erreur s'est produite !`);
                await Acteur.create({
                    nom_complet: particulier.r_nom + ' ' + particulier.r_prenom, 
                    email: email, 
                    telephone: telephone, 
                    adresse: adresse, 
                    type_acteur: type_acteur.r_i, 
                    signataire: 0, 
                    entreprise: 0, 
                    represantant: 0,
                    particulier: particulier.r_i, 
                    langue: langue
                }).then(async acteur => {
                    delete acteur.e_type_acteur;
                    delete acteur.e_entreprise;
                    delete acteur.e_signataire;
                    delete acteur.e_particulier;
                    particulier['acteur'] = acteur;
                    console.log(`Compte particulier créé avec succès`)
                    
                    console.log(`Ajout des paramètres KYC du client..`);
                    if (!particulier) return response(res, 404, `Compte particulier inexistant !`);
                    
                    console.log(`Début de création du KYC`);
                    await KYC.Particulier.create(particulier.r_i, {
                        autres_contexte_ouv,
                        contexte_ouverture_compte,
                        raisons_ouverture_compte,
                        ouverture_compte,
                        lien_parente_sgo,
                        civilite,
                        nom_prenom_titulaire,
                        date_naissance,
                        pays_naissance,
                        pays_residence,
                        situation_matrimoniale,
                        telephone,
                        email,
                        situation_habitat,
                        categorie_professionnelle,
                        autres_categorie_prof,
                        profession,
                        employeur,
                        nbr_enfants,
                        langue_preferee,
                        instrument_paiement_privilige,
                        origine_ressources_investies,
                        autres_origines_ressources,
                        tranche_revenus,
                        autres_actifs,
                        autres_actifs_preciser,
                        autres_comptes_bridge,
                        comptes_bridges,
                        banques_relations,
                        activites_politiques,
                        preciser_activite_politiq,
                        proche_politicien,
                        preciser_proche_politicien
                    }).then(async kyc => {
                        if (!kyc) return response(res, 400, `Une erreur s'est produite !`);
                        console.log(`Ajout de KYC terminé`);
                        
                        console.log(`Créer personne à contacter..`);
                        if (!particulier) return response(res, 404, `Compte particulier inexistant !`);

                        await PersonEmergency.create(particulier.r_i, { 
                            nom_prenom: contact_nom_prenom, 
                            intitule: contact_intitule, 
                            telephone_fixe: contact_telephone_fixe, 
                            telephone_mobile: contact_telephone_mobile, 
                            email: contact_email
                            }).then( async person => {
                            if (!person) return response(res, 400, `Une erreur s'est produite`);
                            delete person.e_particulier;
                            console.log(`Ajout de personne à contacter terminé`);
                                            
                            console.log(`Traitement du profil risque..`);
                            await ProfilRisqueReponse.cleanActeurReponse(acteur.r_i).then(async () => {
                                
                                console.log(`Initialisation des reponses`)
                                for (let pr of profil_reponses) {

                                    const question_ref = pr.question_ref;
                                    const reponse_ref = pr.reponse_ref;

                                    console.log(`Verification des informations`);
                                    await Utils.expectedParameters({question_ref, reponse_ref}).then(async () => {

                                        console.log(`Chargement de la question ${question_ref}`)
                                        await CampagneQuestion.findByRef(question_ref).then(async question => {
                                            await CampagneRepMatrice.findAllByQuestion(question.r_i).then(async matrices => {
                                                for (let matrice of matrices) {
                                                    await CampagneReponse.findAllByLineColumn(matrice.r_i).then(async suggestions => {
                                                        let reponse = null;
                                                        for (let suggestion of suggestions)
                                                            if (suggestion.r_reference==reponse_ref) reponse=suggestion;
                                                        if (reponse) {
                                                            console.log(`Enregistrement de la reponse ${reponse_ref}`)
                                                            await ProfilRisqueReponse.create(reponse.r_points, acteur.r_i, {question_id: question.r_i, reponse_id: reponse.r_i}).catch(err => next(err));
                                                        }
                                                    }).catch(err => next(err));
                                                }
                                            }).catch(err => next(err));
                                        }).catch(err => next(err));
                                    }).catch(err => response(res, 400, err));
                                }
                            }).catch(err => next(err));
                            
                            console.log(`Calcul des points collectées..`)

                            await ProfilRisqueReponse.findAllByActeur(acteur.r_i).then(async reponses => {

                                let point_total = 0;
                                let investisseur = null;
                                let i = 0;
                                await Campagne.findByintitule('profil_risque').then(async campagne => {
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
                                }).catch(err => next(err));
                                    
                                console.log(`Détermination du profil investisseur`)

                                investisseur = await Utils.calculProflInvestisseur(point_total);
                                await Acteur.updateProfilInvestisseur(acteur.r_i, investisseur.profil_investisseur).catch(err => next(err));
                                
                                console.log(investisseur);                                
                                const data = DataFormat.replaceIndividualDataNumeriques(particulier);

                                return response(res, 201, `Compte particulier créé avec succès`, data, investisseur);

                            }).catch(err => next(err));

                        }).catch(err => next(err));

                    }).catch(err => next(err));
                }).catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => next(error));
        }).catch(error => next(error));
        }).catch(error => next(error));
    }).catch(error => response(res, 400, error));
}

const createParticulier = async (req, res, next) => {
    /**
     * [] Vérifier que les paramètres attendu sont bien reçu, ainsi que ceux obligatoires
     * [] Vérifier que le compte (l'adresse e-mail) n'existe pas,
     * - S'il existe retourner une erreur 409 
     * - Sinon poursuivre la création de compte
     * [] Créer le compte particulier
     * [] Créer le compte acteur avec un statut à 1 (compte innactif)
     */

    console.log(`Création d'un compte particulier..`);

    const {
        civilite, 
        nom, 
        nom_jeune_fille, 
        prenom, 
        date_naissance, 
        nationalite, 
        email, 
        adresse, 
        telephone, 
        type_piece, 
        num_piece, 
        piece_validite,
        type_compte_investissement,
        type_compte, 
        langue} = req.body;

    console.log(`Vérification des paramètres`);
    await Utils.expectedParameters({civilite, nom, prenom, date_naissance, email, telephone, type_piece, num_piece, piece_validite, type_compte}).then(async () => {
        
        console.log(`Vérification de l'existance du compte`);
        await Acteur.findByEmail(email).then(async exists_email => {
            if (exists_email) return response(res, 409, `Cette adresse email existe déjà !`);
            
        await Acteur.findByTelephone(telephone).then(async exists_phone => {
            if (exists_phone) return response(res, 409, `Ce numéro de téléphone existe déjà !`);
    
        console.log(`Récupération de l'id du type acteur`);
        await TypeActeur.findByCode("TYAC-003").then(async type_acteur => {
            if (!type_acteur) return response(res, 400, `Problème survenu lors de la determination du type acteur`);
            console.log(`Création du profil particulier`);
            await Client.Particulier.create({
                civilite, 
                nom, 
                nom_jeune_fille, 
                prenom, 
                date_naissance, 
                nationalite, 
                type_piece, 
                num_piece, 
                piece_validite, 
                categorie_fatca, 
                categorie_client, 
                categorie_compte, 
                type_compte_investissement,
                type_compte 
            }).then(async particulier => {
                if (!particulier) return response(res, 400, `Une erreur s'est produite !`); 
                    await Acteur.create({ 
                        nom_complet: particulier.r_nom + ' ' + particulier.r_prenom, 
                        email: email, 
                        telephone: telephone, 
                        adresse: adresse, 
                        type_acteur: type_acteur.r_i, 
                        signataire: 0, 
                        entreprise: 0, 
                        represantant: 0, 
                        particulier: particulier.r_i, 
                        langue: langue 
                    }).then(async acteur => { 
                        delete acteur.e_type_acteur; 
                        delete acteur.e_entreprise; 
                        delete acteur.e_signataire; 
                        delete acteur.e_particulier; 
                        particulier['acteur'] = acteur; 
                        const data = DataFormat.replaceIndividualDataNumeriques(particulier); 
                        return response(res, 201, `Compte particulier créé avec succès`, data); 
                    }).catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => next(error));
        }).catch(error => next(error));
        }).catch(error => next(error));
    }).catch(error => response(res, 400, error));

}

const updateParticulier = async (req, res, next) => {

    console.log(`Modification d'un compte particulier..`);

    const particulier_id = req.params.particulierId;
    const {
        civilite, 
        nom, 
        nom_jeune_fille, 
        prenom, 
        date_naissance, 
        nationalite, 
        email, 
        adresse, 
        telephone, 
        type_piece, 
        num_piece, 
        langue} = req.body;

    await Acteur.findByParticulierId(particulier_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Client nom trouvé`);

        if (email!=acteur.r_email)
            await Acteur.findByEmail(email).then(async result => {
                if (result) return response(res, 409, `Cette adresse email existe déjà !`);
                await Acteur.updateEmail(email, acteur.r_i).catch(err => next(err));
            }).catch(error => next(error));


        if (telephone!=acteur.r_telephone_prp) 
            await Acteur.findByTelephone(telephone).then(async result => {
                if (result) return response(res, 409, `Ce numéro de téléphone existe déjà !`);
                await Acteur.updateTelephone(telephone, acteur.r_i).catch(err => next(err));
            }).catch(error => next(error));

        console.log(`Vérification des paramètres`);
        await Utils.expectedParameters({civilite, nom, prenom, date_naissance}).then(async () => {
            
            console.log(`Mise à jour du profil particulier`);
            await Client.Particulier.update(particulier_id, {civilite, nom, nom_jeune_fille, prenom, date_naissance, nationalite, type_piece, num_piece})
            .then(async particulier_updated => {
                if (!particulier_updated) return response(res, 400, `Une erreur s'est produite !`);
                await Acteur.update(acteur.r_i, {
                    nom_complet: particulier_updated.r_nom + ' ' + particulier_updated.r_prenom,
                    adresse: adresse,
                    langue: langue
                }).then(async acteur_updated => {
                    particulier_updated['acteur'] = acteur_updated;
                    return response(res, 200, `Compte particulier mise à jour`, particulier_updated);
                }).catch(error => next(error));
            }).catch(error => next(error));
            
        }).catch(error => response(res, 400, error));
    }).catch(err => next(err))
}

const updateEntreprise = async (req, res, next) => {

}

const createEntreprise = async (req, res, next) => {
    /**
     * [x] Vérifier que les paramètres attendu sont bien reçu, ainsi que ceux obligatoires
     * [x] Vérifier que le compte (l'adresse e-mail) n'existe pas,
     * - S'il existe retourner une erreur 409 
     * - Sinon poursuivre la création de compte
     * [x] Créer le compte particulier
     * [x] Créer le compte acteur avec un statut à 1 (compte innactif)
     */

    console.log(`Création d'un compte particulier..`);
    const { 
        raison_sociale, 
        forme_juridique, 
        capital_social,
        siege_social,
        compte_contribuable,
        registre_com,
        email, 
        adresse, 
        telephone, 
        langue,
        compte_titre,
        compte_espece} = req.body;

    console.log(`Vérification des paramètres`);
    await Utils.expectedParameters({raison_sociale, forme_juridique, capital_social, siege_social, compte_contribuable, registre_com, email, telephone})
    .then(async () => {
        
        console.log(`Vérification de l'existance du compte`);
        await Acteur.findByEmail(email).then(async result => {
            if (result) return response(res, 409, `Cette adresse email existe déjà !`);
        }).catch(error => next(error));

        await Acteur.findByTelephone(telephone).then(async result => {
            if (result) return response(res, 409, `Ce numéro de téléphone existe déjà !`);
        }).catch(error => next(error));
        
        console.log(`Récupération de l'id du type acteur`);
        await TypeActeur.findByCode("TYAC-002").then(async type_acteur => {
            if (!type_acteur) return response(res, 400, `Problème survenu lors de la determination du type acteur`);
            console.log(`Création du profil entreprise`);
            await Client.Entreprise.create({raison_sociale, forme_juridique, capital_social, siege_social, compte_contribuable, registre_com, compte_titre, compte_espece})
            .then(async entreprise => {
                if (!entreprise) return response(res, 400, `Une erreur s'est produite !`);
                console.log(`Hashage du mot de passe`);
                // await bcrypt.hash(mdp, 10).then(async hash => {
                //     console.log(hash);
                await Acteur.create({
                    nom_complet: entreprise.r_raison_sociale, 
                    email: email, 
                    telephone: telephone, 
                    adresse: adresse, 
                    type_acteur: type_acteur.r_i, 
                    // mdp: hash, 
                    signataire: 0, 
                    entreprise: entreprise.r_i, 
                    represantant: 0,
                    particulier: 0, 
                    langue: langue}).then(acteur => {
                        entreprise['acteur'] = acteur;
                        // await Acteur.updateStatus(acteur.r_i, 1).catch(err => next(err));
                        return response(res, 201, `Compte entreprise créé avec succès`, entreprise);
                    }).catch(error => next(error));
                // }).catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => next(error));
    }).catch(error => response(res, 400, error));
}

const createRepresentant = async (req, res, next) => {

    console.log(`Création d'un representant..`);

    const {civilite, nom, nom_jeune_fille, prenom, date_naissance, nationalite, type_piece, num_piece, fonction} = req.body;
    const entreprise_id = req.params.entrepriseId;

    console.log(`Vérification des paramètres`);
    await Utils.expectedParameters({civilite, nom, prenom, type_piece, num_piece}).then(async () => {
        console.log(`Vérification de l'existance du compte`);
        await Representant.create({ ...req.body }).then(async representant => {
            if (!representant) return response(res, 400,`Une erreur s'est produite`);
            await Acteur.findByEntrepriseId(entreprise_id).then(async acteur => {
                await Acteur.updateRepresentant(acteur.r_i, representant.r_i).then(async result => {
                    // await Acteur.updateStatus(acteur.r_i, 3).catch(err => next(err));
                    return response(res, 201, `Ajout d'un représentant terminé`, representant);
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(error => response(res, 400, error));
}

const getActeurFiles = async (req, res, next) => {
    const acteurId = req.session.e_acteur;
    await Document.findAllByActeurId(acteurId).then(async photos => {
        return response(res, 200, `Chargement terminé`, photos);
    }).catch(err => next(err));
}

const getFile = async (req, res, next) => {
    const ref = req.params.ref;
    await Document.findByRef(ref).then(async photo => {
        if (!photo) return response(res, 404, 'Fichier introuvable !')
        return response(res, 200, `Chargement terminé`, photo);
    }).catch(err => next(err));
}

const uploadPhotoProfil = async (req, res, next) => {

    console.log(`Chargememnt de photo de profil..`)

    const acteur = req.params.acteurId;
    const typedoc_intitule = "photoprofil";
    const nom_fichier = `${req.protocol}://${req.get('host')}/api/bamclient/uploads/${req.file.filename}`;

    await TypeDocument.findByIntitule(typedoc_intitule).then(async typedoc => {
        if(!typedoc) return response(res, 404, `Le type document '${typedoc_intitule}' introuvable !`);
        await Document.create({acteur_id: acteur, type_document: typedoc.r_i, nom_fichier}).then(async document => {
            document['type_document'] = typedoc.r_intitule;
            delete document.e_type_document
            return response(res, 201, `Uploads terminé`, document);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const getPhotoProfil = async (req, res, next) => {
    const acteurId = req.params.acteurId;
    await Document.findBySpecific(acteurId, 'photoprofil').then(async photo => {
        return response(res, 200, `Chargement terminé`, photo);
    }).catch(err => next(err));
}

const uploadDomiciliation = async (req, res, next) => {

    console.log(`Chargememnt de fichier de dominicilisation..`)

    const acteur = req.params.acteurId;
    const typedoc_intitule = "domiciliation";
    const nom_fichier = `${req.protocol}://${req.get('host')}/api/bamclient/uploads/${req.file.filename}`;

    await TypeDocument.findByIntitule(typedoc_intitule).then(async typedoc => {
        if(!typedoc) return response(res, 404, `Le type document '${typedoc_intitule}' introuvable !`);
        await Document.create({acteur_id: acteur, type_document: typedoc.r_i, nom_fichier}).then(async document => {
            document['type_document'] = typedoc.r_intitule;
            delete document.e_type_document
            return response(res, 201, `Uploads terminé`, document);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const getDomiciliation = async (req, res, next) => {
    const acteurId = req.params.acteurId;
    await Document.findBySpecific(acteurId, 'domiciliation').then(async photo => {
        return response(res, 200, `Chargement terminé`, photo);
    }).catch(err => next(err));
}

const uploadSignature = async (req, res, next) => {

    console.log(`Chargememnt de fichier de signature..`);

    const acteur = req.params.acteurId;
    const typedoc_intitule = "signature";
    const nom_fichier = `${req.protocol}://${req.get('host')}/api/bamclient/uploads/${req.file.filename}`;

    await TypeDocument.findByIntitule(typedoc_intitule).then(async typedoc => {
        if(!typedoc) return response(res, 404, `Le type document '${typedoc_intitule}' introuvable !`);
        await Document.create({acteur_id: acteur, type_document: typedoc.r_i, nom_fichier}).then(async document => {
            document['type_document'] = typedoc.r_intitule;
            delete document.e_type_document
            return response(res, 201, `Uploads terminé`, document);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const getSignature = async (req, res, next) => {
    const acteurId = req.params.acteurId;
    await Document.findBySpecific(acteurId, 'signature').then(async photo => {
        return response(res, 200, `Chargement terminé`, photo);
    }).catch(err => next(err));
}

const createPersonEmergency = async (req, res, next) => {

    console.log(`Créer personne à contacter..`);
    
    const particulier_id = req.params.particulierId;
    const {nom_prenom, intitule, telephone_fixe, telephone_mobile, email} = req.body;

    await Utils.expectedParameters({nom_prenom, telephone_mobile}).then(async () => {
        await Client.Particulier.findById(particulier_id).then(async particulier => {
            if (!particulier) return response(res, 404, `Compte particulier inexistant !`);
            await PersonEmergency.create(particulier.r_i, { ...req.body }).then( async person => {
                if (!person) return response(res, 400, `Une erreur s'est produite à l'ajout de personne à contacter`);
                delete person.e_particulier;
                return response(res, 201, `Ajout de personne à contacter terminé`, person);
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(error => response(res, 400, error));
}

const getAllPersonEmergency = async (req, res, next) => { 
    const particulier_id = req.params.particulierId;
    await PersonEmergency.findAllByParticulier(particulier_id)
        .then(async personnes => {
            for (let person of personnes) delete person.e_particulier;
            return response(res, 200, `Chargement des prosonnes à concater`, personnes);
        })
        .catch(err => next(err));
}

const createPassword = async (req, res, next) => {

    console.log(`Création de mote de passe..`)
    
    const acteur_id = req.params.acteurId;
    const mdp = req.body.mdp;

    await Acteur.findById(acteur_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Acteur introuvable !`);
        if (acteur.r_statut!=0) return response(res, 409, `Se compte semble déjà actif !`)
        console.log(`Hashage du mot de passe`);
        await bcrypt.hash(mdp, 10).then(async hash => {
            console.log(hash);
            await Acteur.updatePassword(acteur_id, hash).then(async result => {
                if (!result) return response(res, 400, `Une erreur s'est produite à la création du mot de passe !`);
                
                await OTP.clean(acteur_id).catch(err => next(err)); 

                await Utils.aleatoireOTP().then(async code_otp => {
                    await Utils.genearteOTP_Msgid().then(async msgid => {
                        await OTP.create(acteur_id, {msgid, code_otp, operation: 1}).then(async otp => { 
                            console.log('otp généré:', code_otp);
                            console.log('Envoi de message:', msgid, '..');
                            await fetch(process.env.ML_SMSCI_URL, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    identify: "test@mediasoftci.com",
                                    pwd: "12345",
                                    fromad: "BAM CI",
                                    toad: acteur.r_telephone_prp,
                                    msgid: msgid,
                                    text: `Votre code de vérification est : ${otp.r_code_otp}`
                                })
                            }).then(res => res.json()).then(data => {
                                if (data!=1) return response(res, 200, `Envoi de message echoué`, data);
                                return response(res, 200, `Message de vérification envoyé`);
                            }).catch(err => next(err)); 
                        }).catch(err => next(err)); 
                    }).catch(err => next(err));
                }).catch(err => next(err));
                
                // if (!acteur.r_telephone_prp) return response(res, 404, `Numéro de téléphone principal introuvable !`);
                
                // console.log(`Chargement des données de l'acteur: particulier, kyc, documents, ..`)
                // await Client.Particulier.findById(acteur.e_particulier).then(async particulier => {
                //     if (!particulier) return response(res, 403, `Compte particulier introuvable !`)
                //     await KYC.Particulier.findByParticulierId(acteur.e_particulier).then(async kyc => {
                //         if (!kyc) return response(res, 403, `KYC particulier introuvable !`)
                //         await PersonEmergency.findOneByParticulier(acteur.e_particulier).then(async personne => {
                            
                //             let persNom = personne.r_nom_prenom ? personne.r_nom_prenom.split(' ')[0] : "";
                //             let persPrenom = personne.r_nom_prenom ? personne.r_nom_prenom.split(' ')[1] : "";
                            
                //             await Document.findAllByActeurId(acteur_id).then(async files => {
                                
                //                 // Save to atsgo

                //                 let photo = null;
                //                 let signature = null;

                //                 files.forEach(file => {
                //                     if (file.r_intitule == 'photoprofil') 
                //                         photo = file.r_nom_fichier;

                //                     if (file.r_intitule == 'signature') 
                //                         signature = file.r_nom_fichier;
                //                 })

                //                 console.log(`Préparation de données pour ATSGO`);
                //                 const apikey = req.apikey.r_valeur;

                //                 await Atsgo.onbording(apikey, {
                //                     "nom": particulier.r_nom,
                //                     "prenom": particulier.r_prenom,
                //                     "dateNaissance": particulier.r_date_naissance,
                //                     "tel": acteur.r_telephone_prp,
                //                     "telMobile": acteur.r_telephone_prp,
                //                     "adresse": acteur.r_adresse,
                //                     "email": acteur.r_email,
                //                     "fonction": kyc.r_profession,
                //                     "idTypeClient": 8,
                //                     "photo": photo,
                //                     "idTypePiece" : particulier.r_type_piece,
                //                     "numeroPiece": particulier.r_num_piece,
                //                     "dateValidite": particulier.r_piece_validite,
                //                     "observations": "",
                //                     "sexe": particulier.r_civilite!=1?"Feminin":"Masculin",
                //                     "signature": signature,
                //                     "nomMandataire": "",
                //                     "prenomsMandataire": "",
                //                     "adresseMandataire": "",
                //                     "ppe": false,
                //                     "lienPPE": false,
                //                     "idCategorieFATCA": particulier.r_categorie_fatca,
                //                     "majKyc": new Date(),
                //                     "idCategorieClient": particulier.r_categorie_client,
                //                     "nomBanque": kyc.r_banques_relations,
                //                     "idCategorieCompte": particulier.r_categorie_compte,    
                //                     "idTypeCompte": particulier.r_type_compte_investissement,
                //                     // "idPaysNationalite": 49,
                //                     "idOrigineRevenu": 0, // kyc.r_origine_ressources_investies,
                //                     "revenuMensuel": kyc.r_tranche_revenus,
                //                     // "idClientParent": 0,
                //                     // "idSecteurActivite": 3
                //                 }).catch(async err => response(res, 400, err));

                //             }).catch(err => next(err));
                //         }).catch(err => next(err));

                //     }).catch(err => next(err));
                // }).catch(err => next(err));

            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const verifierOtp = async (req, res, next) => {
    
    console.log(`Vérification OTP..`);
    
    const acteur_id = req.params.acteurId;
    const code_otp = req.body.code_otp;
    
    await Acteur.findById(acteur_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Cet acteur n'existe pas !`);
        
        await OTP.findByActeurId(acteur_id).then(async otp => {
            
            if (!otp) return response(res, 400, `Pas de OTP en cours de validité !`);
            if (code_otp!=otp.r_code_otp)  return response(res, 400, `Vérification echoué !`);
            
            const data = {};

            if (otp.r_operation==1) {

                if (!acteur.r_telephone_prp) return response(res, 404, `Numéro de téléphone principal introuvable !`);
                
                console.log(`Chargement des données de l'acteur: particulier, kyc, documents, ..`)
                await Client.Particulier.findById(acteur.e_particulier).then(async particulier => {
                    if (!particulier) return response(res, 403, `Compte particulier introuvable !`)
                    await KYC.Particulier.findByParticulierId(acteur.e_particulier).then(async kyc => {
                        if (!kyc) return response(res, 403, `KYC particulier introuvable !`)
                        await PersonEmergency.findOneByParticulier(acteur.e_particulier).then(async personne => {
                            
                            let persNom = personne.r_nom_prenom ? personne.r_nom_prenom.split(' ')[0] : "";
                            let persPrenom = personne.r_nom_prenom ? personne.r_nom_prenom.split(' ')[1] : "";
                            
                            await Document.findAllByActeurId(acteur_id).then(async files => {
                                
                                // Save to atsgo

                                let photo = null;
                                let signature = null;

                                files.forEach(file => {
                                    if (file.r_intitule == 'photoprofil') 
                                        photo = file.r_nom_fichier;

                                    if (file.r_intitule == 'signature') 
                                        signature = file.r_nom_fichier;
                                })

                                console.log(`Préparation de données pour ATSGO`);
                                const apikey = req.apikey.r_valeur;

                                await Atsgo.onbording(apikey, {
                                    "nom": particulier.r_nom,
                                    "prenom": particulier.r_prenom,
                                    "dateNaissance": particulier.r_date_naissance,
                                    "tel": acteur.r_telephone_prp,
                                    "telMobile": acteur.r_telephone_prp,
                                    "adresse": acteur.r_adresse,
                                    "email": acteur.r_email,
                                    "fonction": kyc.r_profession,
                                    "idTypeClient": 8,
                                    "photo": photo,
                                    "idTypePiece" : particulier.r_type_piece,
                                    "numeroPiece": particulier.r_num_piece,
                                    "dateValidite": particulier.r_piece_validite,
                                    "observations": "",
                                    "sexe": particulier.r_civilite!=1?"Feminin":"Masculin",
                                    "signature": signature,
                                    "nomMandataire": "",
                                    "prenomsMandataire": "",
                                    "adresseMandataire": "",
                                    "ppe": false,
                                    "lienPPE": false,
                                    "idCategorieFATCA": particulier.r_categorie_fatca,
                                    "majKyc": new Date(),
                                    "idCategorieClient": particulier.r_categorie_client,
                                    "nomBanque": kyc.r_banques_relations,
                                    "idCategorieCompte": particulier.r_categorie_compte,    
                                    "idTypeCompte": particulier.r_type_compte_investissement,
                                    // "idPaysNationalite": 49,
                                    "idOrigineRevenu": 0, // kyc.r_origine_ressources_investies,
                                    "revenuMensuel": kyc.r_tranche_revenus,
                                    // "idClientParent": 0,
                                    // "idSecteurActivite": 3
                                }, async (atsgo_data) => {

                                    await Acteur.activeCompte(acteur_id).catch(err => next(err));
                                    await Atsgo.validateAtsgoAccount(apikey, atsgo_data);
                                    await OTP.confirm(acteur_id, otp.r_i).catch(err => next(err)); 
                                    
                                    return response(res, 200, `Vérification terminé avec succès`);
                                }).catch(async err => response(res, 403, err));

                            }).catch(err => next(err));
                        }).catch(err => next(err));

                    }).catch(err => next(err));
                }).catch(err => next(err));

            } else if (otp.r_operation==2) {
                const default_mdp = uuid.v4().split('-')[0];
                bcrypt.hash(default_mdp, 10).then(async hash => {
                    await Acteur.updatePassword(acteur_id, hash).then(async pwd => {
                        data['reset_mdp'] = default_mdp;
                        await OTP.confirm(acteur_id, otp.r_i).catch(err => next(err)); 
                        return response(res, 200, `Vérification terminé avec succès`, data);
                    }).catch(err => next(err));
                }).catch(err => next(err));
            }

        }).catch(err => next(err));
    }).catch(err => next(err));
}

const renvoiOtp = async (req, res, next) => {
    console.log(`Renvoi du message OTP..`);
    
    const acteur_id = req.params.acteurId;
    
    await Acteur.findById(acteur_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Cet acteur n'existe pas !`);
        if (!acteur.r_telephone_prp) return response(res, 400, `Numéro de téléphone principal introuvable !`);

        await OTP.findByActeurId(acteur_id).then(async otp => {
            if (!otp) return response(res, 404, `Aucun message otp trouvé !`);

            const operation = otp.r_operation;
            await OTP.clean(acteur_id).catch(err => next(err));                          // Operation: 1: activation, 2: reinitialisation

            const url = process.env.ML_SMSCI_URL;
            
            await Utils.aleatoireOTP().then(async code_otp => {
                await Utils.genearteOTP_Msgid().then(async msgid => {
                    await OTP.create(acteur_id, {msgid, code_otp, operation}).then(async otp => {
                        console.log('otp généré:', code_otp);
                        console.log('Envoi de message:', msgid, '..');
                        await fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                identify: "test@mediasoftci.com",
                                pwd: "12345",
                                fromad: "BAM CI",
                                toad: acteur.r_telephone_prp,
                                msgid: msgid,
                                text: `Votre code de vérification est : ${otp.r_code_otp}`
                            })
                        }).then(res => res.json())
                        .then(data => {
                            if (data!=1) return response(res, 400, `Envoi de message echoué`, data);
                                return response(res, 200, `Message otp renvoyé avec succès`, otp);
                        })
                    }).catch(err => next(err)); 
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

module.exports = {
    onbordingParticulier,
    createParticulier,
    updateParticulier,
    createEntreprise,
    updateEntreprise,
    createRepresentant,
    getActeurFiles,
    getFile,
    uploadPhotoProfil,
    getPhotoProfil,
    uploadDomiciliation,
    getDomiciliation,
    uploadSignature,
    getSignature,
    createPersonEmergency,
    getAllPersonEmergency,
    createPassword,
    verifierOtp,
    renvoiOtp
}