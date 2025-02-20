const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');
const app_auth = require('../middlewares/app_auth');

router.post('/encode', authController.sha256encode);
router.get('/verify', app_auth, authController.authVerify);

module.exports = router;