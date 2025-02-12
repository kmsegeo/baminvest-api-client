const response = require('../middlewares/response');
const Acteur = require('../models/Acteur');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utils = require('../utils/utils.methods');

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
            console.log(`Vérification de mot de passe`)
            bcrypt.compare(req.body.mdp, acteur.r_mdp).then(async valid => {
                if(!valid) return response(res, 401, `Login ou mot de passe incorrect !`);
                console.log(`Ouverture de session`)
                await Session.create({
                    os: req.headers.os,
                    adresse_ip: req.headers.adresse_ip,
                    marque_device: req.headers.marque_device,
                    model_device: req.headers.model_device,
                    autres: "",
                    acteur: acteur.r_i
                }).then(session => {
                    return response(res, 200, 'Nouvelle session', {
                        auth_token: jwt.sign(
                            {session: session.r_reference},
                            process.env.SESSION_KEY,
                            // { expiresIn: '24h' }
                        ),
                        session: session
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
    await Session.findAllByActeur(req.params.id).then(sessions => {
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
        if (!session) return response(res, 404, "Session active non trouvée");
        await Session.destroy({
            acteur: req.params.id, 
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