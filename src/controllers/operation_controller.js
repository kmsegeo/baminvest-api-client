const response = require('../middlewares/response');
const Operation = require("../models/Operation");
const Acteur = require("../models/Acteur");
const Session = require("../models/Session");
const Utils = require("../utils/utils.methods");
const TypeOperation = require('../models/TypeOperation');
const TypeMoyenPaiement = require('../models/TypeMoyenPaiement');
const MoyenPaiementActeur = require('../models/PaiementActeur');
const Fonds = require('../models/Fonds');

const getAllTypeOperations = async (req, res, next) => {
    await TypeOperation.findAll()
        .then(typeop => response(res, 200, `Chargement des types d'opération`, typeop))
        .catch(err => next(err));
}

const getAllActeurOperations = async (req, res, next) => {
    const id = req.params.id;
    await Acteur.findById(id).then(async acteur => {
        if (!acteur) return response(res, 404, `Acteur introuvable !`);
        await Operation.findAllByActeur(id)
            .then(operations => response(res, 200, `Chargement des opérations de l'acteur`, operations))
            .catch(err => next(err));
    }).catch(err => next(err));
}

const saveOparation = async (req, res, next) => {
    /**
     * [x] Vérification des paramètres
     * [x] Récuperer le ID acteur après vérification de la session
     * [x] Chargement du type opération
     * [x] Chargement du moyen de paiement
     * [x] Chargement de FCP
     * [x] Enregistrement de l'opération
     */

    console.log(`Création d'opération..`);
    const {session_ref, reference_operateur, libelle, montant, frais_operation, frais_operateur, moyen_paiement, compte_paiement, fonds_ref} = req.body;

    console.log(`Vérification des paramètres`);
    Utils.expectedParameters({session_ref, reference_operateur, libelle, montant, frais_operation, frais_operateur, moyen_paiement, compte_paiement, fonds_ref}).then( async () => {
        console.log('Chargement de la session');
        await Session.findByRef(session_ref).then(async session => {
            console.log(`Chargement du type opération`);
            Utils.selectTypeOperation(req.params.op).then(async op_code => {
                await TypeOperation.findByCode(op_code).then(async type_operation => {
                    if(!type_operation) return response(res, 404, `Type opération non trouvé !`);
                    console.log(`Chargement de moyen de paiment`)
                    await MoyenPaiementActeur.findById(moyen_paiement).then(async moypaiement => {
                        if (!moypaiement) return response(res, 404, `Moyen de paiement non trouvé !`);
                        console.log(`Chargement du FCP`);
                        await Fonds.findByRef(fonds_ref).then(async fonds => {
                            if (!fonds) return response(res, 404, `Ce FCP est inconnu !`);
                            console.log(`Enregistrement de l'opération`);
                            await Operation.create(session.e_acteur, type_operation.r_i, moypaiement.r_i, fonds.r_i, {...req.body})
                                .then(operation => response(res, 201, `Enregistrement d'une opération`, operation))
                                .catch(err => next(err));
                        }).catch(err => next(err));
                    }).catch(err => next(err));
                }).catch(err => next(err));
            }).catch(err => response(res, 400, err));
        }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
}

module.exports = {
    getAllTypeOperations,
    getAllActeurOperations,
    saveOparation
}