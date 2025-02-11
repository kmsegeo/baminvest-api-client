const express = require('express');
const app_auth = require('../middlewares/app_auth');
const clientController = require('../controllers/client_controller')
const kycController = require('../controllers/kyc_controller');
const session_verify = require('../middlewares/session_verify');
const router = express.Router();

router.post('/particulier', app_auth, clientController.createParticulier);
router.post('/particulier/:id/kyc', app_auth, kycController.createParticulierKYC);
router.get('/particulier/:id/kyc', app_auth, kycController.getParticulierKYC);

router.post('/entreprise', app_auth, clientController.createEntreprise);
router.post('/entreprise/:id/kyc', app_auth, kycController.createEntrepriseKYC);
router.get('/entreprise/:id/kyc', app_auth, kycController.getEntrepriseKYC);

module.exports = router;