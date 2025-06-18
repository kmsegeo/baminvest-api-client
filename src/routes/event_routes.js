const express = require('express');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const atsgo_auth = require('../middlewares/atsgo_auth');
const News = require('../models/News');
const Document = require('../models/Document');
const response = require('../middlewares/response');

const router = express.Router();

router.get('/', async (req, res) => {

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // setInterval(() => {
    //     res.write(`data: ${JSON.stringify({ time: new Date().toLocaleTimeString() })}\n\n`)
    // }, 1000)

    setInterval(async () => {
        await News.findAll().then(async results => {
            for(let result of results) {
                await Document.findById(result.e_document).then(async doc => {
                    if (doc) {
                        delete doc.r_i
                        delete doc.r_date_creer
                        delete doc.r_date_modif
                        result['document'] = doc;
                    }
                    delete result.e_document
                }).catch(err => next(err));
            }
            res.write(JSON.stringify({results}));
        }).catch(err => next(err));
    }, 3000);
});

module.exports = router;