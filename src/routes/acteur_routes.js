const express = require('express');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const sessionController = require('../controllers/session_controller');
const clientController = require('../controllers/client_controller')
const kycController = require('../controllers/kyc_controller');
const operationController = require('../controllers/operation_controller')
const campagneController = require('../controllers/campagne_controller')
const router = express.Router();

// PARTICULIER

router.post('/particulier', app_auth, clientController.createParticulier);
router.post('/particulier/kyc', app_auth, session_verify, kycController.createParticulierKYC);
router.get('/particulier/kyc', app_auth, session_verify, kycController.getParticulierKYC);

router.post('/campagne/profilrisque/reponse', app_auth, session_verify, campagneController.saveResponse);
router.get('/campagne/profilrisque/recap', app_auth, session_verify, campagneController.recapProfilRisqueResponses);
router.get('/campagne/profilrisque/build', app_auth, session_verify, campagneController.buildProfilRisqueResponses);

// ENTREPRISE

router.post('/entreprise', app_auth, clientController.createEntreprise);
router.post('/entreprise/kyc', app_auth, session_verify, kycController.createEntrepriseKYC);
router.get('/entreprise/kyc', app_auth, session_verify, kycController.getEntrepriseKYC);

router.post('/entreprise/representant', app_auth, session_verify, clientController.createRepresentant);

// COMMUNS

router.post('/connexion', app_auth, sessionController.login);

router.get('/sessions', app_auth, session_verify, sessionController.loadActiveSsessions);
router.delete('/sessions/:ref', app_auth, session_verify, sessionController.destroySession);

router.get('/operations', app_auth, session_verify, operationController.getAllActeurOperations);

module.exports = router;