const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const moyPaiementController = require('../controllers/moyen_paiement_controller');

router.get('/types', app_auth, session_verify, moyPaiementController.getAllTypeMoypaiement);
router.get('/acteur/:id', app_auth, session_verify, moyPaiementController.getAllPaiementActeur);
router.post('/acteur', app_auth, session_verify, moyPaiementController.savePaiementActeur);

module.exports = router;