const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const clientController = require('../controllers/onbording_controller');
const operationController = require('../controllers/operation_controller')
const moyenPaiementController = require('../controllers/moyen_paiement_controller');
const campagneController = require('../controllers/campagne_controller');

router.get('/type-acteurs', app_auth, clientController.getAllTypeActeurs);
router.get('/campagne/profilrisque/questions', app_auth, campagneController.getProfilRisqueQuestions);

router.get('/type-operations', app_auth, session_verify, operationController.getAllTypeOperations);
router.get('/type-moy-paiements', app_auth, session_verify, moyenPaiementController.getAllTypeMoypaiement);


module.exports = router;