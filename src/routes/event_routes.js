const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const atsgo_auth = require('../middlewares/atsgo_auth');
const response = require('../middlewares/response');
const Operation = require('../models/Operation');
const Acteur = require('../models/Acteur');
const { Particulier } = require('../models/Client');

router.get('/', (req, res, next) => {

    console.log(`Ouverture du socket..`)

    // Set headers to keep the connection alive and tell the client we're sending event-stream data
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send an initial message
    res.write(`data: Connected to server\n\n`);

    // Simulate sending updates from the server
    let counter = 0;
    const intervalId = setInterval(() => {
        counter++;
        // Write the event stream format
        res.write(`data: Message ${counter}\n\n`);
    }, 2000);

    // When client closes connection, stop sending events
    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
});

router.get('/acteurs/operations', app_auth, session_verify, atsgo_auth, async (req, res, next) => {

    console.log('Ouverture de socket: Historique des opérations..')

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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
                res.write(`data: Connected to server\n\n`);
                await fetch(url)
                .then(res => res.json())
                .then(data => {
                    if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des opération !`);
                    for(let payLoad of data.payLoad) delete payLoad.idClient;
                    res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération des opérations: ${new Date().toLocaleString()}`, data: data.payLoad})}\n\n`);
                    res.flushHeaders();
                    cur_operations = operations;
                }).catch(err => next(err));
            }).catch(err=>next(err));
            
            // Chargement à un interval défini
            
            const intervalId = setInterval(async () => {
                await Operation.findAllByActeur(acteur_id).then(async operations => {
                    if (operations.length > cur_operations.length || operations[operations.length-1].r_statut==0) {
                        await fetch(url)
                        .then(res => res.json())
                        .then(data => {
                            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des opération !`);
                            for(let payLoad of data.payLoad) delete payLoad.idClient;
                            res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération des opérations: ${new Date().toLocaleString()}`, data: data.payLoad})}\n\n`);
                            res.flushHeaders();
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
                .then(res => res.json())
                .then(data => {
                    if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des transactions !`);
                    res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération des transactions: ${new Date().toLocaleString()}`, data: data.payLoad})}\n\n`);
                    res.flushHeaders();
                    cur_operations = operations;
                }).catch(err => next(err));
            }).catch(err => next(err));

            // Chargement à un interval défini

            const intervalId = setInterval(async () => {
                await Operation.findAllByActeur(acteur_id).then(async operations => {
                    if (operations.length > cur_operations.length || operations[operations.length-1].r_statut==0) {
                        await fetch(url)
                        .then(res => res.json())
                        .then(data => {
                            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des transactions !`);
                            res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération des transactions: ${new Date().toLocaleString()}`, data: data.payLoad})}\n\n`);
                            res.flushHeaders();
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