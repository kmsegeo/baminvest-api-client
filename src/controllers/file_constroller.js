const response = require("../middlewares/response");
const Document = require("../models/Document");

const getAllFiles = async (req, res, next) => {
    
    const intitule = req.query.intitule;

    if (!intitule) 
        await Document.findAll().then(async documents => {
            return response(res, 200, `Chargement terminé`, documents);
        }).catch(err => next(err));
    else
        await Document.findAllByIntitule(intitule).then(async documents => {
            return response(res, 200, `Chargement terminé`, documents);
        }).catch(err => next(err));

}

const getOneFile = async (req, res, next) => {
    const ref = req.params.ref;
    await Document.findByRef(ref).then(async document => {
        if (!document) return response(res, 404, `Document non trouvé !`);
        return response(res, 200, `Chargement terminé`, document);
    }).catch(err => next(err));
}

module.exports = {
    getAllFiles,
    getOneFile
}