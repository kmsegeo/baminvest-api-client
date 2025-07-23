const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const atsgo_auth = require('../middlewares/atsgo_auth');
const response = require('../middlewares/response');
const Operation = require('../models/Operation');
const Acteur = require('../models/Acteur');
const { Particulier } = require('../models/Client');

router.get('/acteurs/operations', app_auth, session_verify, atsgo_auth, async (req, res, next) => {

    console.log('Ouverture de socket: Historique des opérations..')

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération des opérations: ${new Date().toLocaleString()}`, data})}\n\n`);
        res.flushHeaders();
    };

    const acteur_id = req.session.e_acteur;
    
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`); 

    console.log(`Recupération des données client`)
    await Acteur.findById(acteur_id).then(async acteur => {
        await Particulier.findById(acteur.e_particulier).then(async particulier => {

            const idClient = particulier.r_atsgo_id_client;
            const apikey = req.apikey.r_valeur;
            const date = new Date().getFullYear() + '-'  + new Date().getMonth() + '-' + new Date().getDate();
            const url = process.env.ATSGO_URL + process.env.URI_CLIENT_OPERATIONS + '?ApiKey=' + apikey + '&IdClient=' + idClient;
            console.log(url);

            let cur_operations = [];

            // Chargement pour la première fois

            await Operation.findAllByActeur(acteur_id).then(async operations => {
                await fetch(url)
                .then(resp => resp.json())
                .then(data => {
                    if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des opération !`);
                    for(let payLoad of data.payLoad) delete payLoad.idClient;
                    sendEvent(data.payLoad);
                    cur_operations = operations;
                }).catch(err => next(err));
            }).catch(err=>next(err));
            
            // Chargement à un interval défini
            
            const intervalId = setInterval(async () => {
                await Operation.findAllByActeur(acteur_id).then(async operations => {
                    if (operations.length > cur_operations.length || operations[operations.length-1].r_statut==0) {
                        await fetch(url)
                        .then(resp => resp.json())
                        .then(data => {
                            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des opération !`);
                            for(let payLoad of data.payLoad) delete payLoad.idClient;
                            sendEvent(data.payLoad);
                            if (cur_operations.length==0 || operations[operations.length-1].r_statut!=0) cur_operations = operations;
                        }).catch(err => next(err));
                    }
                }).catch(err=>next(err));
            }, 5000);

            res.on('close', () => {
                console.log(`Fermeture du socket: Historique des opérations`);
                clearInterval(intervalId);
                res.end();
            })

        }).catch(err => next(err));
    }).catch(err => next(err));

});

router.get('/acteurs/transactions', app_auth, session_verify, atsgo_auth, async (req, res, next) => {

    console.log('Ouverture de socket: Historique des transactions..')
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération des transactions: ${new Date().toLocaleString()}`, data})}\n\n`);
        res.flushHeaders();
    };

    const acteur_id = req.session.e_acteur;

    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);
    
    console.log(`Recupération des données client`)
    await Acteur.findById(acteur_id).then(async acteur => {
        await Particulier.findById(acteur.e_particulier).then( async particulier => {
            
            const id_client = particulier.r_atsgo_id_client;
            const apikey = req.apikey.r_valeur;
            const date = new Date().getFullYear() + '-'  + new Date().getMonth() + '-' + new Date().getDate();
            const url = process.env.ATSGO_URL + process.env.URI_CLIENT_MOUVEMENTS + '?ApiKey=' + apikey + '&IdClient=' + id_client;
            console.log(url)

            let cur_operations = [];

            // Chargement pour la première fois

            await Operation.findAllByActeur(acteur_id).then(async operations => {
                await fetch(url)
                .then(resp => resp.json())
                .then(data => {
                    if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des transactions !`);
                    sendEvent(data.payLoad);
                    res.flushHeaders();
                    cur_operations = operations;
                }).catch(err => next(err));
            }).catch(err => next(err));

            // Chargement à un interval défini

            const intervalId = setInterval(async () => {
                await Operation.findAllByActeur(acteur_id).then(async operations => {
                    if (operations.length > cur_operations.length || operations[operations.length-1].r_statut==0) {
                        await fetch(url)
                        .then(resp => resp.json())
                        .then(data => {
                            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des transactions !`);
                            sendEvent(data.payLoad);
                            if (cur_operations.length==0 || operations[operations.length-1].r_statut!=0) cur_operations = operations;
                        }).catch(err => next(err));                        
                    }
                }).catch(err => next(err));
            }, 5000);

            res.on('close', () => {
                console.log(`Fermeture du socket: Historique des opérations`);
                clearInterval(intervalId);
                res.end();
            })

        }).catch(err => next(err));
    }).catch(err => next(err));
    
});

module.exports = router;