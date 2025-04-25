const express = require('express');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const sessionController = require('../controllers/session_controller');
const onbordingController = require('../controllers/onbording_controller')
const clientController = require('../controllers/client_controller')
const kycController = require('../controllers/kyc_controller');
const operationController = require('../controllers/operation_controller')
const campagneController = require('../controllers/campagne_controller')
const upload = require('../middlewares/multer-config');
const atsgo_auth = require('../middlewares/atsgo_auth');
const portefeuilleController = require('../controllers/portefeuille_controller');
const transactionController = require('../controllers/transaction_controller')

const router = express.Router();

// ONBORDING: PARTICULIER

router.post('/particulier/onbording', app_auth, onbordingController.onbordingParticulier);

router.post('/particulier', app_auth, onbordingController.createParticulier);
router.put('/particulier/:particulierId', app_auth, onbordingController.updateParticulier);

router.post('/particulier/:particulierId/kyc', app_auth, kycController.createParticulierKYC);
router.get('/particulier/:particulierId/kyc', app_auth, kycController.getParticulierKYC);
router.put('/particulier/:particulierId/kyc', app_auth, kycController.updateParticulierKYC);

router.post('/particulier/:particulierId/personne_contacter', app_auth, onbordingController.createPersonEmergency);
router.get('/particulier/:particulierId/personne_contacter', app_auth, onbordingController.getAllPersonEmergency);

router.post('/particulier/:particulierId/profilrisque/reponses', app_auth, campagneController.saveAllResponses);
router.get('/particulier/:particulierId/profilrisque/reponses/recap', app_auth, campagneController.recapProfilRisqueResponses);

// ONBORDING: ENTREPRISE

router.post('/entreprise', app_auth, onbordingController.createEntreprise);
router.post('/entreprise/:entrepriseId/kyc', app_auth, kycController.createEntrepriseKYC);
router.get('/entreprise/:entrepriseId/kyc', app_auth, kycController.getEntrepriseKYC);

router.post('/entreprise/:entrepriseId/representant', app_auth, onbordingController.createRepresentant);

// ONBORDING: COMMUNS

router.post('/:acteurId/fichiers/photoprofil', app_auth, upload.single('file'), onbordingController.uploadPhotoProfil);
router.get('/:acteurId/fichiers/photoprofil', app_auth, onbordingController.getPhotoProfil);

router.post('/:acteurId/fichiers/domiciliation', app_auth, upload.single('file'), onbordingController.uploadDomiciliation);
router.get('/:acteurId/fichiers/domiciliation', app_auth, onbordingController.getDomiciliation);

router.post('/:acteurId/fichiers/signature', app_auth, upload.single('file'), onbordingController.uploadSignature);
router.get('/:acteurId/fichiers/signature', app_auth, onbordingController.getSignature);

router.post('/:acteurId/motdepasse/activer', app_auth, atsgo_auth, onbordingController.createPassword);
router.post('/motdepasse/reinitialiser', app_auth, clientController.resetPassword);
router.put('/motdepasse/modifier', app_auth, clientController.updatePassword);

// OTP

router.get('/:acteurId/otp/renvoyer', app_auth, onbordingController.renvoiOtp);
router.post('/:acteurId/otp/verifier', app_auth, onbordingController.verifierOtp);

/////////////////////////
//    SESSION ACTIVE
/////////////////////////

router.post('/connexion', app_auth, sessionController.login);

router.get('/sessions', app_auth, session_verify, sessionController.loadActiveSsessions);
router.delete('/sessions/:ref', app_auth, session_verify, sessionController.destroySession);

// SOMMAIRE
// router.get('/resume', app_auth, session_verify, atsgo_auth, clientController.getActeurResumes);

// FICHIERS

router.get('/fichiers', app_auth, session_verify, onbordingController.getActeurFiles);
router.get('/fichiers/:ref', app_auth, session_verify, onbordingController.getFile);

// PORTEFEUILLE

router.get('/portefeuilles', app_auth, session_verify, atsgo_auth, portefeuilleController.getClientProtefeuilles);
router.get('/transactions', app_auth, session_verify, atsgo_auth, transactionController.getTransactionHistorique);
// router.get('/portefeuilles/evolution/:periode', app_auth, session_verify, atsgo_auth, portefeuilleController.getPortefeuilleEvolution);

// OPERATION

router.get('/operations', app_auth, session_verify, atsgo_auth, operationController.getAllActeurOperations);
router.post('/operations/souscription', app_auth, session_verify, atsgo_auth, operationController.opSouscription);
router.post('/operations/rachat', app_auth, session_verify, atsgo_auth, operationController.opRachat);
router.get('/operations/souscription/:id/paiement/statut', app_auth, session_verify, atsgo_auth, transactionController.checkWaveTransaction);
// router.post('/operations/wave/transfert', app_auth, session_verify, atsgo_auth, transactionController.waveTransfert);

// OPERATION: 

module.exports = router;