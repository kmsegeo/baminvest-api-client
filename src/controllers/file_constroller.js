const response = require("../middlewares/response");
const Document = require("../models/Document");

const getAllFiles = async (req, res, next) => {
    
    const intitule = req.query.intitule;

    const expected = ['dici', 'prospectus', 'brochure', 'factsheet'];

    if (!intitule) 
        return response(res, 403, `Intitulé de type fichier attendu !`)

    if (!expected.includes(intitule))
        return response(res, 403, `L'intitulé ne fait pas partie des types attendus !`);

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