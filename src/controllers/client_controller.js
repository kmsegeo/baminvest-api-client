const response = require('../middlewares/response');
const Utils = require('../utils/utils.methods');
const Client = require('../models/Client');
const Acteur = require('../models/Acteur');
const TypeActeur = require('../models/TypeActeur');
const bcrypt = require('bcryptjs');

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
     * [] Créer le compte acteur avec un statut à 0 (compte innactif)
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
        mdp, 
        type_compte, 
        rib, 
        langue} = req.body;

    console.log(`Vérification des paramètres`);
    await Utils.expectedParameters({civilite, nom, prenom, date_naissance, nationalite, email, type_acteur, mdp, type_compte})
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
                    console.log(`Hashage du mot de passe`);
                    await bcrypt.hash(mdp, 10).then(async hash => {
                        console.log(hash);
                        await Acteur.create({
                            nom_complet: particulier.r_nom + ' ' + particulier.r_prenom, 
                            email: email, 
                            telephone: telephone, 
                            adresse: adresse, 
                            type_acteur: type_acteur.r_i, 
                            mdp: hash, 
                            signataire: 0, 
                            entreprise: 0, 
                            represantant: 0,
                            particulier: particulier.r_i, 
                            rib: rib, 
                            langue: langue}).then(acteur => {
                                particulier['acteur'] = acteur;
                                return response(res, 201, `Compte particulier créé avec succès`, particulier);
                            }).catch(error => next(error));
                    }).catch(error => next(error));
                }).catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => next(error));
    }).catch(error => response(res, 400, error));
}

const createEntreprise = async (req, res, next) => {
    /**
     * [] Vérifier que les paramètres attendu sont bien reçu, ainsi que ceux obligatoires
     * [] Vérifier que le compte (l'adresse e-mail) n'existe pas,
     * - S'il existe retourner une erreur 409 
     * - Sinon poursuivre la création de compte
     * [] Créer le compte particulier
     * [] Créer le compte acteur avec un statut à 0 (compte innactif)
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
        mdp, 
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
                    await bcrypt.hash(mdp, 10).then(async hash => {
                        console.log(hash);
                        await Acteur.create({
                            nom_complet: entreprise.r_raison_sociale, 
                            email: email, 
                            telephone: telephone, 
                            adresse: adresse, 
                            type_acteur: type_acteur.r_i, 
                            mdp: hash, 
                            signataire: 0, 
                            entreprise: entreprise.r_i, 
                            represantant: 0,
                            particulier: 0, 
                            rib: rib, 
                            langue: langue}).then(acteur => {
                                entreprise['acteur'] = acteur;
                                return response(res, 201, `Compte entreprise créé avec succès`, entreprise);
                            }).catch(error => next(error));
                    }).catch(error => next(error));
                }).catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => next(error));
    }).catch(error => response(res, 400, error));
}

module.exports = {
    getAllTypeActeurs,
    createParticulier,
    createEntreprise
}