const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const vlController = require('../controllers/valeur_liquidative_controller');
const atsgo_auth = require('../middlewares/atsgo_auth');

router.get('/', app_auth, session_verify, atsgo_auth, vlController.getAllValeurLiquidatives);

module.exports = router;