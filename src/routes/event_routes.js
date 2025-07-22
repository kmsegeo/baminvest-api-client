const express = require('express');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const atsgo_auth = require('../middlewares/atsgo_auth');
const Document = require('../models/Document');
const response = require('../middlewares/response');
const Reclamation = require('../models/Reclamation');
const Operation = require('../models/Operation');
const Acteur = require('../models/Acteur');
const { Particulier } = require('../models/Client');

const router = express.Router();

router.get('/acteurs/operations', app_auth, session_verify, atsgo_auth, async (req, res, next) => {

    console.log('Ouverture de socket d\'historique des opérations...')

    const acteur_id = req.session.e_acteur;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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
                console.log(`Première opération de souscription`)
                await fetch(url)
                .then(async res => res.json())
                .then(async data => {
                    if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des opération !`);
                    for(let payLoad of data.payLoad) delete payLoad.idClient;
                    console.log('data.payLoad')
                    res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération des opérations: ${new Date().toLocaleString()}`, data: data.payLoad})}\n\n`);
                    cur_operations = operations;
                }).catch(err => next(err));
            }).catch(err=>next(err));

            // Chargement à un interval défini
            
            setInterval(async () => {

                await Operation.findAllByActeur(acteur_id).then(async operations => {

                    if (operations.length > cur_operations.length) {
                        await fetch(url)
                        .then(async res => res.json())
                        .then(async data => {
                            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des opération !`);
                            for(let payLoad of data.payLoad) delete payLoad.idClient;
                            res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération des opérations: ${new Date().toLocaleString()}`, data: data.payLoad})}\n\n`);
                        }).catch(err => next(err));

                        if (cur_operations.length==0 || operations[operations.length-1].r_statut!=0) cur_operations = operations;
                    }
                }).catch(err=>next(err));

            }, 15000);

        }).catch(err => next(err));
    }).catch(err => next(err));
});

router.get('/acteurs/transactions', app_auth, session_verify, atsgo_auth, async (req, res, next) => {

    console.log('Ouverture de socket d\'historique des transactions...')

    const acteur_id = req.session.e_acteur;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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
                console.log(`Première opération de transaction`)
                await fetch(url)
                .then(async res => res.json())
                .then(async data => {
                    if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des transactions !`);
                    console.log('data.payLoad')
                    res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération des transactions: ${new Date().toLocaleString()}`, data: data.payLoad})}\n\n`);
                    cur_operations = operations;
                }).catch(err => next(err));
            }).catch(err => next(err));

            // Chargement à un interval défini

            setInterval(async () => {

                await Operation.findAllByActeur(acteur_id).then(async operations => {

                    if (operations.length > cur_operations.length) {
                        await fetch(url)
                        .then(async res => res.json())
                        .then(async data => {
                            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des transactions !`);
                            res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération des transactions: ${new Date().toLocaleString()}`, data: data.payLoad})}\n\n`);
                        }).catch(err => next(err));

                        if (cur_operations.length==0 || operations[operations.length-1].r_statut!=0) cur_operations = operations;
                    }
                }).catch(err => next(err));

            }, 15000);

        }).catch(err => next(err));
    }).catch(err => next(err));
    
});

module.exports = router;