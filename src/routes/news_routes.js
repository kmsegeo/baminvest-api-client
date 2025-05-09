const express = require('express');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const newsController = require('../controllers/news_controller')

const router = express.Router();

router.get('/', app_auth, session_verify, newsController.getLastNews);
router.get('/:id', app_auth, session_verify, newsController.getOneNews);

module.exports = router;