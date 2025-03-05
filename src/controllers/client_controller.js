const response = require('../middlewares/response');
const Utils = require('../utils/utils.methods');
const Client = require('../models/Client');
const Acteur = require('../models/Acteur');
const TypeActeur = require('../models/TypeActeur');
const bcrypt = require('bcryptjs');
const Representant = require('../models/Representant');
const Document = require('../models/Document');
const TypeDocument = require('../models/TypeDocument');

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
        rib, 
        langue} = req.body;

    console.log(`Vérification des paramètres`);
    await Utils.expectedParameters({civilite, nom, prenom, date_naissance, email, type_acteur, type_compte})
    .then(async () => {
        console.log(`Vérification de l'existance du compte`);
        await Acteur.findByEmail(email).then(async result => {
            if (result) return response(res, 409, `Ce compte existe déjà !`);
            console.log(`Récupération de l'id du type acteur`);
            await TypeActeur.findByCode(type_acteur).then(async type_acteur => {
                console.log(type_acteur);
                console.log(`Création du profil particulier`);
                await Client.Particulier.create({civilite, nom, nom_jeune_fille, prenom, date_naissance, nationalite, type_piece, num_piece, type_compte})
                .then(async particulier => {
                    if (!particulier) return response(res, 400, `Une erreur s'est produite !`);
                    console.log(particulier)
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
                            rib: rib, 
                            langue: langue
                        }).then(async acteur => {
                            particulier['acteur'] = acteur;
                            // await Acteur.updateStatus(acteur.r_i, 1).catch(err => next(err));
                            return response(res, 201, `Compte particulier créé avec succès`, particulier);
                        }).catch(error => next(error));
                    // }).catch(error => next(error));
                }).catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => next(error));
    }).catch(error => response(res, 400, error));
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
        rib, 
        langue} = req.body;

    console.log(`Vérification des paramètres`);
    await Utils.expectedParameters({raison_sociale, forme_juridique, capital_social, siege_social, compte_contribuable, registre_com})
    .then(async () => {
        console.log(`Vérification de l'existance du compte`);
        await Acteur.findByEmail(email).then(async result => {
            if (result) return response(res, 409, `Ce compte existe déjà !`);
            console.log(`Récupération de l'id du type acteur`);
            await TypeActeur.findByCode(type_acteur).then(async type_acteur => {
                console.log(type_acteur);
                console.log(`Création du profil entreprise`);
                await Client.Entreprise.create({raison_sociale, forme_juridique, capital_social, siege_social, compte_contribuable, registre_com})
                .then(async entreprise => {
                    if (!entreprise) return response(res, 400, `Une erreur s'est produite !`);
                    console.log(entreprise)
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
                            rib: rib, 
                            langue: langue}).then(acteur => {
                                entreprise['acteur'] = acteur;
                                // await Acteur.updateStatus(acteur.r_i, 1).catch(err => next(err));
                                return response(res, 201, `Compte entreprise créé avec succès`, entreprise);
                            }).catch(error => next(error));
                    // }).catch(error => next(error));
                }).catch(error => next(error));
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
            return response(res, 201, `Uploads terminé`, document);
        }).catch(err => next(err));
    }).catch(err => next(err));
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
                if (!result) return response(res, 400, `Une erreur s'est produite à la création du mot de passe !`, acteur);
                await Acteur.activeCompte(acteur_id).catch(err => next(err));
                return response(res, 200, `Création de mot de passe terminé`);
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

module.exports = {
    getAllTypeActeurs,
    createParticulier,
    createEntreprise,
    createRepresentant,
    uploadPhotoProfil,
    uploadSignature,
    createPassword,
}