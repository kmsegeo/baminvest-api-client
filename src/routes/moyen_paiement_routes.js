const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const moyenPaiementController = require('../controllers/moyen_paiement_controller');

// router.get('/types', app_auth, session_verify, moyenPaiementController.getAllTypeMoypaiement);

router.get('/', app_auth, session_verify, moyenPaiementController.getAllMoyPaiementActeur);
router.post('/', app_auth, session_verify, moyenPaiementController.saveMoyPaiementActeur);
router.get('/valeur/:val', app_auth, session_verify, moyenPaiementController.getMoyPaiementActeur);
router.put('/:id', app_auth, session_verify, moyenPaiementController.updateMoyPaiementActeur);

module.exports = router;