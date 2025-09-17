const response = require("../middlewares/response");
const Document = require("../models/Document");

const getAllFiles = async (req, res, next) => {
    
    const intitule = req.query.intitule;
    const prefix_fonds = req.query.prefix_fonds;

    const expected = ['dici', 'prospectus', 'brochure', 'factsheet'];

    if (prefix_fonds) {
        let documents = [];
        for(let e of expected) { 
            let docs = await Document.findAllByIntitule(e);
            for (let d of docs) {
                let prefix_ref = d.r_reference.split(':')[0];
                if (prefix_ref==prefix_fonds) 
                    if (intitule) {
                        if (!expected.includes(intitule))
                            return response(res, 403, `L'intitulé ne fait pas partie des types attendus !`);
                        if (intitule==d.r_intitule)
                            documents.push(d);
                    } else {
                        documents.push(d);
                    }
            }
        }
        return response(res, 200, `Chargement terminé`, documents);
    }
    // return response(res, 403, `Intitulé de type fichier attendu !`);

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