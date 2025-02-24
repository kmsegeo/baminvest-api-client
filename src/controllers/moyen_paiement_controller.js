const response = require('../middlewares/response');
const MoyPaiementActeur = require('../models/MoyPaiementActeur');
const Session = require('../models/Session');
const TypeMoyenPaiement = require('../models/TypeMoyenPaiement');
const Utils = require('../utils/utils.methods');

const getAllTypeMoypaiement = async (req, res, next) => {
    await TypeMoyenPaiement.findAll()
    .then(typemp => {
        if (typemp.length==0) return response(res, 404, `Aucun type moyen de paiement disponible`);
        return response(res, 200, `Chargement des type moyen de paiement disponible`, typemp);
    }).catch(err => next(err));
}

const getAllMoyPaiementActeur = async (req, res, next) => {
    const id = req.acteur;
    await MoyPaiementActeur.findAllByActeur(id).then(paiements => {
        if (paiements.length==0) return response(res, 404, `Aucun paiement effectué`);
        return response(res, 200, `Chargement des paiement disponible de l'acteur`, paiements);
    }).catch(err => next(err));
}

const saveMoyPaiementActeur = async (req, res, next) => {
    console.log(`Création d'un paiement..`)
    const {session_ref, type_mp_code, valeur, intitule} = req.body;
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, type_mp_code, valeur, intitule}).then( async () => {
        console.log(`Chargement de session`)
        await Session.findByRef(session_ref).then(async session => {
            if(!session) return response(res, 401, `Vérifier la reférence de session`);
            console.log(`Chargement du type moyen de paiement`)
            await TypeMoyenPaiement.findByCode(type_mp_code).then(async typemp => {
                if (!typemp) return response(res, 404, `Type moyen de paiement non trouvé !`);
                console.log(`Enregistrement du paiement`)
                await MoyPaiementActeur.create(session.e_acteur, typemp.r_i, {valeur, intitule})
                    .then(paiement => response(res, 201, `Enregistrement de paiement acteur`, paiement))
                    .catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
}

const getMoyPaiementActeur = async (req, res, next) => {
    const valeur = req.params.val;
    await MoyPaiementActeur.findByValeur(valeur).then(moyPaiement => {
        if (!moyPaiement) return response(res, 404, `Moyen de paiement introuvable !`);
        return response(res, 200, `Chargement du moyen de paiement`, moyPaiement);
    }).catch(err => next(err));
}

const updateMoyPaiementActeur = async (req, res, next) => {
    console.log(`Mises à jour de paiement..`)
    const id = req.params.id;
    const {session_ref, type_mp_code, valeur, intitule} = req.body;
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, type_mp_code, valeur, intitule}).then(async () => {
        console.log(`Chargement de session`)
        await Session.findByRef(session_ref).then( async session => {
            console.log(`Chargement du type moyen de paiement`)
            await TypeMoyenPaiement.findByCode(type_mp_code).then(async typemp => {
                if (!typemp) return response(res, 404, `Type moyen de paiement non trouvé !`);
                console.log(`Mises à jour du moyen de paiement`)
                await MoyPaiementActeur.update(id, typemp.r_i, {valeur, intitule})
                    .then(paiement => response(res, 201, `Mises à jour du moyen de paiement acteur`, paiement))
                    .catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
}

module.exports = {
    getAllTypeMoypaiement,
    getAllMoyPaiementActeur,
    saveMoyPaiementActeur,
    getMoyPaiementActeur,
    updateMoyPaiementActeur
}