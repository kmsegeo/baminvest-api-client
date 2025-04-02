const response = require('../middlewares/response');

const getLastNews = async (req, res, next) => {

    console.log('Chargement des news..')
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);

    return response(res, 200, 'Chargement de news terminé', []);
}

const getOneNews = async (req, res, next) => {

    console.log('Chargement d\'une news..')
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);

    return response(res, 404, 'News non trouvé !', []);
}

module.exports = {
    getLastNews,
    getOneNews
}