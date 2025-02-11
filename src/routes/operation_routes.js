const express = require('express');
const router = express.Router();

const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')

const operationController = require('../controllers/operation_controller')

router.get('/types', app_auth, session_verify, operationController.getAllTypeOperations);
router.post('/:op', app_auth, session_verify, operationController.saveOparation);

module.exports = router;