const response = require('../middlewares/response');
const Acteur = require('../models/Acteur');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utils = require('../utils/utils.methods');
const { Particulier, Entreprise } = require('../models/Client');

const login = async (req, res, next) => {

    /**
     * [x] Récupérer les données de l'acteur à partir de l'adresse e-mail
     * [x] Comparer le mot pas entré avec celui enregistré avec les données récupérées
     * [x] Si valid: créer une session avec les information entrée dans le header
     */

    console.log(`Connexion..`)
    const {email, mdp} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({email, mdp}).then(async () => {

        console.log(`Chargement de l'acteur`)
        await Acteur.findByEmail(req.body.email).then(acteur => {
            if (!acteur) return response(res, 401, `Login ou mot de passe incorrect !`);
            console.log(acteur)
            if (acteur.e_agent && acteur.e_agent!=0) return response(res, 401, `Ce compte n'est pas enregistré en tant que client`);
            console.log(`Vérification de mot de passe`)
            bcrypt.compare(req.body.mdp, acteur.r_mdp).then(async valid => {
                if(!valid) return response(res, 401, `Login ou mot de passe incorrect !`);
                console.log(`Création de session`)
                await Session.create({
                    os: req.headers.os,
                    adresse_ip: req.headers.adresse_ip,
                    marque_device: req.headers.marque_device,
                    model_device: req.headers.model_device,
                    autres: "",
                    acteur: acteur.r_i
                }).then(async session => {
                    let acteur = null;
                    await Acteur.findById(session.e_acteur).then(async result => {
                        if (!result) return response(res, 400, `Une erreur s'est produite à la récupération de l'acteur !`);
                        if (result.e_entreprise==0 && result.e_particulier!=0) {            // Particulier
                            await Particulier.findById(result.e_particulier).then(async particulier => {
                                if (!particulier) return response(res, 400, `Une erreur s'est produite à la récupération du compte client !`);
                                result['particulier'] = particulier;
                            }).catch(err => next(err));
                        } else if (result.e_entreprise!=0 && result.e_particulier==0) {     // Entreprise
                            await Entreprise.findById(result.e_entreprise).then(async entreprise => {
                                if (!entreprise) return response(res, 400, `Une erreur s'est produite à la récupération du compte client !`);
                                result['entreprise'] = entreprise;
                            }).catch(err => next(err));
                        }
                        acteur = result;
                    }).catch(err => next(err));
                    return response(res, 200, 'Ouverture de session', {
                        auth_token: jwt.sign(
                            {session: session.r_reference},
                            process.env.SESSION_KEY,
                            // { expiresIn: '24h' }
                        ),
                        session: session,
                        acteur: acteur
                    });
                }).catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => next(error));
    }).catch(error => response(res, 400, error));
}

const loadActiveSsessions = async (req, res, next) => {
    /**
     * [x] Charger les sessions actives de l'agent
     */
    console.log(`Chargement des sessions de l'acteur`);
    await Session.findAllByActeur(req.session.e_acteur).then(sessions => {
        for (let index = 0; index < sessions.length; index++)
            delete sessions[index].r_statut;
        return response(res, 200, "Chargement terminé", sessions);
    }).catch(error => next(error));
}

const destroySession = async (req, res, next) => {
    /**
     * [x] Vérifier que la session reférencée existe
     * [x] Destruuire la session active selectionnée de l'agent
     */
    console.log(`Destruction de la session: ${req.params.ref}`);
    await Session.findByRef(req.params.ref).then(async session => {
        if (!session) return response(res, 404, "Session non trouvée");
        await Session.destroy({
            acteur: req.session.e_acteur, 
            ref: req.params.ref
        }).then(() => response(res, 200, "Session détruite"))
        .catch(error => next(error));
    }).catch(error => next(error));
}

module.exports = {
    login,
    loadActiveSsessions,
    destroySession
}