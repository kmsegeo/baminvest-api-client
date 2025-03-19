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
const uuid = require('uuid');

const getAllTypeActeurs = async (req, res, next) => {
    console.log(`Récupération des types acteur..`);
    await Client.TypeActeur.findAll()
        .then(types => response(res, 200, `Liste des acteurs`, types))
        .catch(error => next(error));
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
        type_acteur, 
        type_piece, 
        num_piece, 
        type_compte, 
        langue,
        compte_titre,
        compte_espece} = req.body;

    console.log(`Vérification des paramètres`);
    await Utils.expectedParameters({civilite, nom, prenom, date_naissance, email, telephone, type_acteur, type_compte}).then(async () => {
        
        console.log(`Vérification de l'existance du compte`);
        await Acteur.findByEmail(email).then(async result => {
            if (result) return response(res, 409, `Cette adresse email existe déjà !`);
        }).catch(error => next(error));

        await Acteur.findByTelephone(telephone).then(async result => {
            if (result) return response(res, 409, `Ce numéro de téléphone existe déjà !`);
        }).catch(error => next(error));

        console.log(`Récupération de l'id du type acteur`);
        await TypeActeur.findByCode(type_acteur).then(async type_acteur => {
            console.log(`Création du profil particulier`);
            await Client.Particulier.create({civilite, nom, nom_jeune_fille, prenom, date_naissance, nationalite, type_piece, num_piece, type_compte, compte_titre, compte_espece})
            .then(async particulier => {
                if (!particulier) return response(res, 400, `Une erreur s'est produite !`);
                // console.log(`Hashage du mot de passe`);
                // await bcrypt.hash(mdp, 10).then(async hash => {
                    // console.log(hash);
                    await Acteur.create({
                        nom_complet: particulier.r_nom + ' ' + particulier.r_prenom, 
                        email: email, 
                        telephone: telephone, 
                        adresse: adresse, 
                        type_acteur: type_acteur.r_i, 
                        // mdp: hash, 
                        signataire: 0, 
                        entreprise: 0, 
                        represantant: 0,
                        particulier: particulier.r_i, 
                        langue: langue
                    }).then(async acteur => {
                        particulier['acteur'] = acteur;
                        // await Acteur.updateStatus(acteur.r_i, 1).catch(err => next(err));
                        return response(res, 201, `Compte particulier créé avec succès`, particulier);
                    }).catch(error => next(error));
                // }).catch(error => next(error));
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
        adresse, 
        type_piece, 
        num_piece, 
        langue} = req.body;

    await Acteur.findByParticulierId(particulier_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Client nom trouvé`);
    
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
        type_acteur, 
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
        await TypeActeur.findByCode(type_acteur).then(async type_acteur => {
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

const uploadPhotoProfil = async (req, res, next) => {
    const acteur = req.params.acteurId;
    const typedoc_intitule = "photoprofil";
    const nom_fichier = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    await TypeDocument.findByIntitule(typedoc_intitule).then(async typedoc => {
        if(!typedoc) return response(res, 404, `Le type document '${typedoc_intitule}' introuvable !`);
        await Document.create({acteur_id: acteur, type_document: typedoc.r_i, nom_fichier}).then(async document => {
            document['type_document'] = typedoc.r_intitule;
            delete document.e_type_document
            return response(res, 201, `Uploads terminé`, document);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const uploadDomiciliation = async (req, res, next) => {
    const acteur = req.params.acteurId;
    const typedoc_intitule = "domiciliation";
    const nom_fichier = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    await TypeDocument.findByIntitule(typedoc_intitule).then(async typedoc => {
        if(!typedoc) return response(res, 404, `Le type document '${typedoc_intitule}' introuvable !`);
        await Document.create({acteur_id: acteur, type_document: typedoc.r_i, nom_fichier}).then(async document => {
            document['type_document'] = typedoc.r_intitule;
            delete document.e_type_document
            return response(res, 201, `Uploads terminé`, document);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const uploadSignature = async (req, res, next) => {
    const acteur = req.params.acteurId;
    const typedoc_intitule = "signature";
    const nom_fichier = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    await TypeDocument.findByIntitule(typedoc_intitule).then(async typedoc => {
        if(!typedoc) return response(res, 404, `Le type document '${typedoc_intitule}' introuvable !`);
        await Document.create({acteur_id: acteur, type_document: typedoc.r_i, nom_fichier}).then(async document => {
            document['type_document'] = typedoc.r_intitule;
            delete document.e_type_document
            return response(res, 201, `Uploads terminé`, document);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const createPersonEmergency = async (req, res, next) => {
    
    console.log(`Créer personne à contacter..`)
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
    const acteur_id = req.params.acteurId;
    const mdp = req.body.mdp;
    await Acteur.findById(acteur_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Acteur introuvable !`);
        if (acteur.r_statut!=0) return response(res, 400, `Se compte semble déjà actif !`)
        console.log(`Hashage du mot de passe`);
        await bcrypt.hash(mdp, 10).then(async hash => {
            console.log(hash);
            await Acteur.updatePassword(acteur_id, hash).then(async result => {
                if (!result) return response(res, 400, `Une erreur s'est produite à la création du mot de passe !`);
                if (!acteur.r_telephone_prp) return response(res, 400, `Numéro de téléphone principal introuvable !`);
                
                await OTP.clean(acteur_id, 1).catch(err => next(err)); 

                const url = process.env.ML_SMSCI_URL;
                
                await Utils.aleatoireOTP().then(async code_otp => {
                    await Utils.genearteOTP_Msgid().then(async msgid => {
                        await OTP.create(acteur_id, {msgid, code_otp, operation: 1}).then(async otp => { 
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
                                return response(res, 200, `Message de vérification envoyé`);
                            })
                        }).catch(err => next(err)); 
                    }).catch(err => next(err));
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const verifierOtp = async (req, res, next) => {
    const acteur_id = req.params.acteurId;
    const code_otp = req.body.code_otp;
    await Acteur.findById(acteur_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Cet acteur n'existe pas !`);
        await OTP.findByActeurId(acteur_id).then(async otp => {
            
            if (!otp) return response(res, 400, `Pas de OTP en cours de validité !`);
            if (code_otp!=otp.r_code_otp)  return response(res, 400, `Vérification echoué !`);
            
            const data = {};
            if (otp.r_operation==1) {
                await Acteur.activeCompte(acteur_id).catch(err => next(err));
            } else if (otp.r_operation==2) {
                const default_mdp = uuid.v4().split('-')[0];
                bcrypt.hash(default_mdp, 10).then(async hash => {
                    await Acteur.updatePassword(acteur_id, hash).catch(err => next(err));
                }).catch(err => next(err));
                data['reset_mdp'] = default_mdp;
            }

            await OTP.confirm(acteur_id, otp.r_i).catch(err => next(err)); 
            return response(res, 200, `Vérification terminé avec succès`, data);

        }).catch(err => next(err));
    }).catch(err => next(err));
}

const renvoiOtp = async (req, res, next) => {
    
    const acteur_id = req.params.acteurId;
    
    await Acteur.findById(acteur_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Cet acteur n'existe pas !`);
        await OTP.findByActeurId(acteur_id).then(async otp => {
            if (!acteur.r_telephone_prp) return response(res, 400, `Numéro de téléphone principal introuvable !`);
            
            const operation = otp.r_operation;
            await OTP.clean(acteur_id).catch(err => next(err));                          // Operation: 1: activation, 2: reinitialisation

            const url = process.env.ML_SMSCI_URL;
            
            await Utils.aleatoireOTP().then(async code_otp => {
                await Utils.genearteOTP_Msgid().then(async msgid => {
                    await OTP.create(acteur_id, {msgid, code_otp, operation}).then(async otp => {
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
    getAllTypeActeurs,
    createParticulier,
    updateParticulier,
    createEntreprise,
    updateEntreprise,
    createRepresentant,
    uploadPhotoProfil,
    uploadDomiciliation,
    uploadSignature,
    createPersonEmergency,
    getAllPersonEmergency,
    createPassword,
    verifierOtp,
    renvoiOtp
}