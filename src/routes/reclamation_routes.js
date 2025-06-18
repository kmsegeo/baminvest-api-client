const express = require('express');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const router = express.Router();
const reclamationController = require('../controllers/reclamation_controller');
const upload = require('../middlewares/multer-config');

router.get('/', app_auth, session_verify, reclamationController.getAllActeurReclamations);
router.post('/', app_auth, session_verify, upload.single('file'), reclamationController.createActeurReclamation)

module.exports = router;