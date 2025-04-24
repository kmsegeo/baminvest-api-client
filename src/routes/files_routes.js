const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const fileController = require('../controllers/file_constroller');

router.get('/', app_auth, session_verify, fileController.getAllFiles);
router.get('/:ref', app_auth, session_verify, fileController.getOneFile);

module.exports = router;