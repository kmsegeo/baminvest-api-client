const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const fondsController = require('../controllers/fonds_controller');
const atsgo_auth = require('../middlewares/atsgo_auth');
const fileController = require('../controllers/file_constroller');

router.get('/', app_auth, session_verify, atsgo_auth, fondsController.getVlFonds);
router.get('/valeur_liquidatives', app_auth, session_verify, atsgo_auth, fondsController.getAllValeurLiquidatives);

router.post('/simulateur', app_auth, session_verify, fondsController.calculateSimulator);
router.post('/simulateur/versement', app_auth, session_verify, fondsController.calculateVersementSimulator);

router.post('/operation/frais', app_auth, session_verify, atsgo_auth, fondsController.calculateOperationFees);

router.get('/fichiers', app_auth, session_verify, fileController.getAllFiles);
router.get('/fichiers/:ref', app_auth, session_verify, fileController.getOneFile);

module.exports = router;