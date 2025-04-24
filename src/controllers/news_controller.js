const response = require('../middlewares/response');
const Document = require('../models/Document');
const News = require('../models/News');

const getLastNews = async (req, res, next) => {

    console.log('Chargement des news..')
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);

    await News.findAll().then(async results => {
        for(let result of results) {
            await Document.findById(result.e_document).then(async doc => {
                if (doc) {
                    delete doc.r_i
                    delete doc.r_date_creer
                    delete doc.r_date_modif
                    result['document'] = doc;
                }
                delete result.e_document
            }).catch(err => next(err));
        }
        return response(res, 200, `Chargement des news terminé`, results)
    }).catch(err => next(err));

}

const getOneNews = async (req, res, next) => {

    console.log('Chargement d\'une news..');
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);

    const id = req.params.id;
    await News.findById(id).then(async result => {
        if (!result) return response(res, 404, 'Article non trouvé !');
        await Document.findById(result.e_document).then(async doc => {
            if (doc) {
                delete doc.r_i
                delete doc.r_date_creer
                delete doc.r_date_modif
                result['document'] = doc;
                delete result.e_document
            }
            return response(res, 200, `Chargement de l'article`, result);
        }).catch(err => next(err));
    }).catch(err => next(err));

}

module.exports = {
    getLastNews,
    getOneNews
}