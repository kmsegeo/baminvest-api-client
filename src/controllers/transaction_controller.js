const { default: axios } = require("axios");
const response = require("../middlewares/response");
const Acteur = require("../models/Acteur");
const { Particulier } = require("../models/Client");
const Utils = require("../utils/utils.methods");
const Wave = require("../utils/wave.methods");
const Atsgo = require("../utils/atsgo.methods");
const Operation = require("../models/Operation");
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

                // for(let payLoad of data.payLoad) {
                //     delete payLoad.etat;
                // }

                return response(res, 200, 'Chargement de l\'historique terminé', data.payLoad);
            })

        }).catch(err => next(err));
    }).catch(err => next(err));
}

// OPERATEUR: WAVE

const checkOperationStatus = async (req, res, next) => {
    
    console.log(`Vérification de transaction..`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const apikey = req.apikey.r_valeur;
    const acteur_id = req.session.e_acteur;
    const operationRef = req.params.ref;

    let statut = {
        enregistre: false,
        envoye: false,
        valide: false
    }

    console.log(`Recupération des données client`)
    await Acteur.findById(acteur_id).then(async acteur => {
        await Particulier.findById(acteur.e_particulier).then(async particulier => {
            const idClient = particulier.r_atsgo_id_client;

            console.log(`Chargement des opération client`)
            const intervalId = setInterval(async () => {

                let operation_data = {};
                await Operation.findAllByActeur(acteur_id).then(async operations => {

                    for (let operation of operations) {
                        if (operation.r_reference==operationRef) {
                            
                            operation_data = 
                            {
                                r_reference: operation.r_reference,
                                r_libelle: operation.r_libelle,
                                r_montant: operation.r_montant,
                                r_date_creer: operation.r_date_creer
                            };

                            console.log("Ref:", operation.r_reference);

                            statut.enregistre = true;
                            statut.envoye = operation.r_statut==1 ? true:false;
                            
                            if (operation.r_statut==1)
                            await Atsgo.findClientOperation(apikey, idClient, async atsgo_operations => {
                                for (let atsgo_operation of atsgo_operations) {
                                    if (atsgo_operation.referenceOperation==operation.r_reference) {
                                        statut.valide = atsgo_operation.etat=="VALIDE" ? true:false;
                                        console.log(atsgo_operation.etat);
                                        if (statut.valide) {
                                            clearInterval(intervalId);
                                            console.log(`Opération validée !`);
                                        }
                                        // operation_data = atsgo_operation;
                                    }
                                }
                            }).catch(err => next(err));
                        }
                    }

                    res.write(`data: ${JSON.stringify({statut: "SUCCESS", message: `Dernière récupération: ${new Date().toLocaleString()}`, analytics:statut, data:operation_data})}\n\n`);
                    res.flushHeaders();

                }).catch(err => next(err));
            }, 5000);

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
    checkOperationStatus,
    getTransactionHistorique
}