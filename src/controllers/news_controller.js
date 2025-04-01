const response = require('../middlewares/response');

const getLastNews = async (req, res, next) => {

    return response(res, 200, 'Chargement de news terminé', []);
}

const getOneNews = async (req, res, next) => {

    return response(res, 404, 'News non trouvé !', []);
}

module.exports = {
    getLastNews,
    getOneNews
}