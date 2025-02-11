const express = require('express');
const router = express.Router();

const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')

const clientController = require('../controllers/client_controller')

router.get('/', app_auth, session_verify, clientController.getAllTypeActeurs);

module.exports = router;