const express = require('express');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const atsgo_auth = require('../middlewares/atsgo_auth');
const Document = require('../models/Document');
const response = require('../middlewares/response');
const Reclamation = require('../models/Reclamation');

const router = express.Router();

router.get('/', app_auth, session_verify, async (req, res, next) => {

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let r = [];
    const acteur_id = req.session.e_acteur;

    setInterval(async () => {

        await Reclamation.findActeurAll(acteur_id).then(async results => {
            for(let result of results) {
                result['document'] = null;
                if (result.e_document)
                await Document.findById(result.e_document).then(async document => {
                    result['document'] = document;
                }).catch(err => next(err));
                delete result.e_document;
                delete result.e_acteur;
            }
            
            if (results.length > r.length) {
                res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération ${new Date().toLocaleString()}`, data: results})}\n\n`);
                r = results;
            }

        }).catch(err => next(err));

    }, 3000);
});

module.exports = router;