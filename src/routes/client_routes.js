const express = require('express');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const clientController = require('../controllers/client_controller')
const kycController = require('../controllers/kyc_controller');
const router = express.Router();

// router.post('/particulier', app_auth, clientController.createParticulier);
// router.post('/particulier/:id/kyc', app_auth, session_verify, kycController.createParticulierKYC);
// router.get('/particulier/:id/kyc', app_auth, session_verify, kycController.getParticulierKYC);

// router.post('/entreprise', app_auth, clientController.createEntreprise);
// router.post('/entreprise/:id/kyc', app_auth, session_verify, kycController.createEntrepriseKYC);
// router.get('/entreprise/:id/kyc', app_auth, session_verify, kycController.getEntrepriseKYC);
router.delete('/particulier/clean', app_auth, clientController.cleanAllParticulier);

module.exports = router;