const response = require("../middlewares/response");
const Reclamation = require("../models/Reclamation");

const getAllActeurReclamations = async (req, res, next) => {
    
    console.log('Chargement de la liste des reclamations..');
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`); 

    const acteur_id = req.session.e_acteur;

    await Reclamation.findActeurAll(acteur_id).then(async results => {
        return response(res, 200, `Récupération des reclamations de l'acteur`, results);
    }).catch(err => next(err));

}

const createActeurReclamation = async (req, res, next) => {
    
    console.log('Enregistrement d\'une reclamations..');
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`); 

    const acteur_id = req.session.e_acteur;
    const {objet, description, document} = req.body;

    console.log(acteur_id)
    
    await Reclamation.create(acteur_id, {objet, description, document}).then(async result => {
        return response(res, 201, `Enregistrement de la reclamation terminé`, result);
    }).catch(err => next(err));
}

module.exports = {
    getAllActeurReclamations,
    createActeurReclamation
}