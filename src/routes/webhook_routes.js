const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const operationController = require('../controllers/operation_controller')

router.post('/wave/checkout/payment-received', app_auth, session_verify, operationController.opSouscriptionCompleted);

// router.post('/rachat', app_auth, session_verify, operationController.opRachat);
// router.post('/transfert', app_auth, session_verify, operationController.opTransfert);

module.exports = router;