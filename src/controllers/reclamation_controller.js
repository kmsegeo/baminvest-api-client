const response = require("../middlewares/response");
const Utils = require('../utils/utils.methods');
const Reclamation = require("../models/Reclamation");
const Document = require("../models/Document");
const TypeDocument = require("../models/TypeDocument");

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
    const filename = req.file?.filename;
    const objet = req.body.objet;
    const description = req.body.description;

    const typedoc_intitule = "reclamation";
    const nom_fichier = `${req.protocol}://${req.get('host')}/api/bamclient/uploads/${filename}`;

    Utils.expectedParameters({objet, description}).then(async () => {
        
        let upload_document = null;

        await TypeDocument.findByIntitule(typedoc_intitule).then(async typedoc => {
            if(!typedoc) return response(res, 404, `Le type document '${typedoc_intitule}' introuvable !`);
            
            if (filename) 
            await Document.create({acteur_id: acteur_id, type_document: typedoc.r_i, nom_fichier}).then(async document => {
                if (!document) return response(res, 400, `Importation du document échoué !`);
                document['type_document'] = typedoc.r_intitule;
                delete document.e_type_document
                console.log('Uploads terminé', document.r_nom_fichier);

                await Reclamation.create(acteur_id, {objet, description, e_document: document.r_i}).then(async result => {
                    console.log(document)
                    if (result) result['document'] = null;
                    if (result.e_document) result['document'] = document;
                    delete result.e_document;
                    delete result.e_acteur;
                    return response(res, 201, `Enregistrement de la reclamation terminé`, result);
                }).catch(err => next(err));
            }).catch(err => next(err));

            else 
            await Reclamation.create(acteur_id, {objet, description, e_document: null}).then(async result => {
                result['document'] = null;
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