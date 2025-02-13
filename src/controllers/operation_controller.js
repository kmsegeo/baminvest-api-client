const response = require('../middlewares/response');
const Operation = require("../models/Operation");
const Acteur = require("../models/Acteur");
const Session = require("../models/Session");
const Utils = require("../utils/utils.methods");
const TypeOperation = require('../models/TypeOperation');
const MoyenPaiementActeur = require('../models/MoyPaiementActeur');
const Fonds = require('../models/Fonds');
const CircuitValidation = require('../models/CircuitValidation');
const CircuitEtape = require('../models/CircuitEtape');
const CircuitAffectation = require('../models/CircuitAffectation');

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
     * [x] Chargement de la session pour en deduire le ID de l'acteur
     * [x] Chargement du type opération correspondant à l'opération 
     *     [x] Vérifier si le type opération est soumis ou non à un circuit de validation
     *         Si oui : 
     *         -[x] Status de l'opération = 0
     *         -[x] Récuperer les étapes de validation, pour en déduire les acteur cible
     *         -[x] Créer une entrer pour chaque acteur dans la table affectation
     *     [x] Si non : Status de l'opération = 1 (opération valide d'emblé)
     * [x] Chargement du moyen de paiement de l'acteur
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
                            console.log(`Vérification des circuits de validation`);
                            await CircuitValidation.findAllByTypeOperation(type_operation.r_i).then(async circuit => {
                                let status = 1;        // Soumis à aucun circuit de validation
                                if (circuit) {
                                    console.log(`Le type opération est soumis à un circuit de validation`)
                                    status = 0;
                                } console.log(`Enregistrement de l'opération`);
                                await Operation.create(session.e_acteur, type_operation.r_i, moypaiement.r_i, fonds.r_i, status, {...req.body}).then(async operation => {
                                    if (!operation) return response(res, 400, `Une erreur s'est produit !`);
                                    console.log(`Chargement des étapes du circuit`);
                                    if (status==0) {
                                        await CircuitEtape.findAllByCircuitId(circuit.r_i).then(async etapes => {
                                            if (etapes.length==0) return response(res, 400, `Aucune étape de validation trouvé`);
                                            try {
                                                AffectationPanierValidation(etapes, operation);
                                            } catch (error) {
                                                console.log(error);
                                                return response(res, 400, error);
                                            }
                                        }).catch(err => next(err));
                                    }
                                    return response(res, 201, `Enregistrement de l'opération terminé`, operation);
                                }).catch(err => next(err));
                            }).catch(err => next(err));
                        }).catch(err => next(err));
                    }).catch(err => next(err));
                }).catch(err => next(err));
            }).catch(err => response(res, 400, err));
        }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
}

async function AffectationPanierValidation(etapes, operation) {

    console.log(`Affectation au panier de validation`);

    for(let etape of etapes) {
        console.log(etape)
        console.log(`Vérificartion du type de l'étape`);
        if (etape.r_type==1) {  // 1:Validation sur profil
            console.log('Vérification du profil')
            if (etape.e_profil!=0) {
                await Acteur.findAllByProfil(etape.e_profil).then(async acteurs => {
                    console.log(`Vérification des acteurs`)
                    if (acteurs.length==0) throw "Une erreur s'es produite à l'affectation de l'acteur";
                    for(let acteur of acteurs) {
                        console.log(`Affectation à l'acteur`, acteur.r_i);
                        await CircuitAffectation.create(etape.e_circuit_validation, operation.r_i, acteur.r_i).then(affectation => {
                            if (!affectation) throw "Une erreur s'es produite à l'affectation de l'acteur";
                        }).catch(err => next(err));
                    }
                }).catch(err => next(err));
            }
        } 
        if (etape.r_type==2) {  // 2:Validation par un type acteur
            console.log(`Vérificartion du type de l'étape`);
            if (etape.e_type_acteur!=0) {
                console.log('Vérification du type acteur')
                await Acteur.findAllByTypeActeur(etape.e_type_acteur).then(async acteurs => {
                    if (acteurs.length==0) throw "Une erreur s'es produite à l'affectation de l'acteur";
                    for(let acteur of acteurs) {
                        console.log(`Affectation à l'acteur`, acteur.r_i);
                        await CircuitAffectation.create(etape.e_circuit_validation, operation.r_i, acteur.r_i).then(affectation => {
                            if (!affectation) throw "Une erreur s'es produite à l'affectation de l'acteur";
                        }).catch(err => next(err));
                    }
                }).catch(err => next(err));
            }
        }
        if (etape.r_type==3) {  // 3: Validation par un acteur
            console.log(`Vérificartion du type de l'étape`);
            if (etape.e_acteur!=0) {
                console.log(`Affectation à l'acteur`, etape.e_acteur);
                await CircuitAffectation.create(etape.e_circuit_validation, operation.r_i, etape.e_acteur).then(affectation => {
                    if (!affectation) throw "Une erreur s'es produite à l'affectation de l'acteur";
                }).catch(err => next(err));
            }
        }
    }
}

module.exports = {
    getAllTypeOperations,
    getAllActeurOperations,
    saveOparation
}