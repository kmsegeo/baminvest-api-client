const response = require('../middlewares/response');
const FAQ = require('../models/faq_model');

const getAllFaqs = async (req, res, next) => { 
    try {
        const data = await FAQ.findAll();
        response(res, 200, 'Chargement des FAQs terminé', data);
    } catch (error) {
        next(error);
    }
}

const createFaq = async (req, res, next) => {
    try {
        const { question, reponse } = req.body;
        const data = await FAQ.create({ question, reponse });
        response(res, 201, 'Enregistrement de FAQ terminé', data);
    } catch (error) {
        next(error);
    }
}

const updateFaq = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { question, reponse } = req.body;
        const data = await FAQ.update(id, { question, reponse });
        response(res, 200, 'Mise à jour de FAQ terminé', data);
    } catch (error) {
        next(error);
    }
}

const deleteFaq = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await FAQ.delete(id);
        response(res, 200, 'Suppression de FAQ terminé', data);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllFaqs,
    createFaq,
    updateFaq,
    deleteFaq
}