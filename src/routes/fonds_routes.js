const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const fondsController = require('../controllers/fonds_controller');
const atsgo_auth = require('../middlewares/atsgo_auth');

router.get('/', app_auth, session_verify, atsgo_auth, fondsController.getAllFonds);
router.get('/valeur_liquidatives', app_auth, session_verify, atsgo_auth, fondsController.getVlFonds);

module.exports = router;