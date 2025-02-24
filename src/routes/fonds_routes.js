const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const fondsController = require('../controllers/fonds_controller')

router.get('/', app_auth, session_verify, fondsController.getAllFonds);

module.exports = router;