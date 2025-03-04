const express = require('express');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const sessionController = require('../controllers/session_controller');
const clientController = require('../controllers/client_controller')
const kycController = require('../controllers/kyc_controller');
const operationController = require('../controllers/operation_controller')
const campagneController = require('../controllers/campagne_controller')
const upload = require('../middlewares/multer-config');
const router = express.Router();

// ONBORDING: PARTICULIER

router.post('/particulier', app_auth, clientController.createParticulier);
router.post('/particulier/:particulierId/kyc', app_auth, kycController.createParticulierKYC);
router.get('/particulier/:particulierId/kyc', app_auth, kycController.getParticulierKYC);

router.post('/particulier/:particulierId/profilrisque/reponse', app_auth, campagneController.saveResponse);
router.get('/particulier/:particulierId/profilrisque/recap', app_auth, campagneController.recapProfilRisqueResponses);
router.get('/particulier/:particulierId/profilrisque/terminer', app_auth, campagneController.buildProfilRisqueResponses);

// ONBORDING: ENTREPRISE

router.post('/entreprise', app_auth, clientController.createEntreprise);
router.post('/entreprise/:entrepriseId/kyc', app_auth, kycController.createEntrepriseKYC);
router.get('/entreprise/:entrepriseId/kyc', app_auth, kycController.getEntrepriseKYC);

router.post('/entreprise/:entrepriseId/representant', app_auth, clientController.createRepresentant);

// ONBORDING: COMMUNS

router.post('/:acteurId/fichiers/photoprofil', app_auth, upload.single('file'), clientController.uploadPhotoProfil);
router.post('/:acteurId/fichiers/signature', app_auth, upload.single('file'), clientController.uploadSignature);
router.post('/:acteurId/motdepasse/active', app_auth, clientController.createPassword);

// SESSION ACTIVE

router.post('/connexion', app_auth, sessionController.login);

router.get('/sessions', app_auth, session_verify, sessionController.loadActiveSsessions);
router.delete('/sessions/:ref', app_auth, session_verify, sessionController.destroySession);

router.get('/operations', app_auth, session_verify, operationController.getAllActeurOperations);

module.exports = router;