const response = require('../middlewares/response');
const Fonds = require('../models/Fonds');

const getAllFonds = async (req, res, next) => {
    await Fonds.findAll()
        .then(fonds => response(res, 200, `Chargement des fonds`, fonds))
        .catch(err => next(err));
}

module.exports = {
    getAllFonds
}