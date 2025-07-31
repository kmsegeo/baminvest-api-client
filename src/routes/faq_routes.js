const express = require('express');
const faqController = require('../controllers/faq_controller');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');

const router = express.Router();

router.get('/', app_auth, session_verify, faqController.getAllFaqs);
// router.post('/', app_auth, session_verify, faqController.createFaq);
// router.put('/:id', app_auth, session_verify, faqController.updateFaq);
// router.delete('/:id', app_auth, session_verify, faqController.deleteFaq);

module.exports = router;
