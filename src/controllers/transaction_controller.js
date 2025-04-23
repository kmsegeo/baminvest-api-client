const { default: axios } = require("axios");
const response = require("../middlewares/response");
const Acteur = require("../models/Acteur");
const { Particulier } = require("../models/Client");
const Utils = require("../utils/utils.methods");
const Wave = require("../utils/wave.methods");
const Atsgo = require("../utils/atsgo.methods");
// const axios = require('axios');

const getTransactionHistorique = async (req, res, next) => {
    
    console.log('Chargement de l\'historique des transactions...')
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);
    
    await Acteur.findById(req.session.e_acteur).then(async acteur => {
        await Particulier.findById(acteur.e_particulier).then( async particulier => {
            
            // const id_client = particulier.r_ncompte_titre;
            const id_client = particulier.r_atsgo_id_client;
            const apikey = req.apikey.r_valeur;
            const date = new Date().getFullYear() + '-'  + new Date().getMonth() + '-' + new Date().getDate();

            const url = process.env.ATSGO_URL + process.env.URI_CLIENT_MOUVEMENTS + '?ApiKey=' + apikey + '&IdClient=' + id_client;
            console.log(url)

            await fetch(url)
            .then(async res => res.json())
            .then(async data => {
                if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des transactions !`);

                for(let payLoad of data.payLoad) {
                    delete payLoad.etat;
                }

                return response(res, 200, 'Chargement de l\'historique terminé', data.payLoad);
            })

        }).catch(err => next(err));
    }).catch(err => next(err));
}

// OPERATEUR: WAVE

const checkWaveTransaction = async (req, res, next) => {
    
    console.log(`Vérification de transaction wave..`)
    const apikey = req.apikey.r_valeur;
    const acteur_id = req.session.e_acteur;
    const idOperation = req.params.id;

    console.log(`Recupération des données client`)
    await Acteur.findById(acteur_id).then(async acteur => {
        await Particulier.findById(acteur.e_particulier).then(async particulier => {
        
            // const idClient = particulier.r_ncompte_titre;
            const idClient = particulier.r_atsgo_id_client;

            console.log(`Chargement des opération client`)
            await Atsgo.findClientOperation(apikey, idClient, async operations => {

                for (let operation of operations) {
                    if (operation.idOperationClient==idOperation) {
                        await Wave.checkoutCheck(operation.referenceOperation, async result => {
                            const data = {
                                // mobile_payeur:  result.enforce_payer_mobile,
                                // amount: result.amount,
                                // currency: result.currency,
                                statut_paiement: result.payment_status,
                                // date_creation: result.when_created,
                                // date_expire: result.when_expires
                            }
                            return response(res, 200, `Vérification terminé`, data);
                        }).catch(err => next(err));
                    }
                }
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

// const waveTransfert = async (req, res, next) => {

//     console.log(`Initialisation de paiement wave..`);
//     if (req.headers.op_code!='TYOP-006') return response(res, 403, `Type opération non authorisé !`);

//     const apikey = req.apikey.r_valeur;
//     const {idFcp, montant, mobile_payeur, callback_erreur, callback_succes} = req.body;
//     const acteur_id = req.session.e_acteur;

//     Utils.expectedParameters({idFcp, montant, mobile_payeur, callback_erreur, callback_succes}).then(async () => {

//         console.log(`Recupération des données client`)
//         await Acteur.findById(acteur_id).then(async acteur => {
//             await Particulier.findById(acteur.e_particulier).then(async particulier => {
                
//                 const date = new Date();
//                 const idClient = particulier.r_ncompte_titre;
//                 const idClient = particulier.r_atsgo_id_client;

//                 await Wave.checkout(montant, mobile_payeur, callback_erreur, callback_succes, async data => {
//                     console.log(`Enregistrement de mouvement`)
//                     await Atsgo.saveMouvement(apikey, {
//                         idTypeMouvement: 1,       // 1:Apport Liquidité - 2:Retrait de Liquidités
//                         idClient,
//                         idFcp,
//                         date: date,
//                         dateMouvement: data.when_created,
//                         dateValeur: data.when_created,
//                         idModePaiement: 6,
//                         montant: data.amount,
//                         libelle: data.id
//                     }, async mouvement_data => {
                        
//                         let transfert_data = {
//                             moyen_paiement: "TMOP-002",
//                             code: data.id,
//                             montant: data.amount,
//                             devise: data.currency,
//                             paiement_url: data.wave_launch_url,
//                             date_creation: data.when_created,
//                             date_expire: data.when_expires,
//                             idMouvement: mouvement_data.idMouvement
//                         }
    
//                         return response(res, 200, `Initialisation de paiement terminé`, transfert_data);

//                     }).catch(err => next(err));

//                 }).catch(err => next(err));


//     }).catch(err => response(res, 400, err));
// }

module.exports = {
    // waveTransfert,
    checkWaveTransaction,
    getTransactionHistorique
}