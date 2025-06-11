const response = require("../middlewares/response");
const Utils = require('../utils/utils.methods');
const Reclamation = require("../models/Reclamation");
const Document = require("../models/Document");

const getAllActeurReclamations = async (req, res, next) => {
    
    console.log('Chargement de la liste des reclamations..');
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`); 

    const acteur_id = req.session.e_acteur;

    await Reclamation.findActeurAll(acteur_id).then(async results => {
        for(let result of results) {
            result['document'] = null;
            if (result.e_document)
            await Document.findById(result.e_document).then(async document => {
                result['document'] = document;
            }).catch(err => next(err));
            delete result.e_document;
            delete result.e_acteur;
        }
        return response(res, 200, `Récupération des reclamations de l'acteur`, results);
    }).catch(err => next(err));

}

const createActeurReclamation = async (req, res, next) => {
    
    console.log('Enregistrement d\'une reclamations..');
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`); 

    const acteur_id = req.session.e_acteur;
    const {objet, description, document_ref} = req.body;
    
    Utils.expectedParameters({objet, description}).then( async () => {
        let document_id = null;
        await Document.findByRef(document_ref).then(async document => {
            if (document) document_id = document.r_i;
            await Reclamation.create(acteur_id, {objet, description, e_document: document_id}).then(async result => {
                if (result) result['document'] = null;
                if (result.e_document)
                await Document.findById(result.e_document).then(async document => {
                    result['document'] = document;
                }).catch(err => next(err));
                delete result.e_document;
                delete result.e_acteur;
                return response(res, 201, `Enregistrement de la reclamation terminé`, result);
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));

}

module.exports = {
    getAllActeurReclamations,
    createActeurReclamation
}