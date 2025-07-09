const response = require("../middlewares/response");
const Acteur = require("../models/Acteur");
const Client = require("../models/Client");
const OTP = require("../models/OTP");
const Utils = require("../utils/utils.methods");
const bcrypt = require('bcryptjs');

const getActeurResumes = async (req, res, next) => {

    console.log(`Chargement du sommaire !`)

    const acteur_id = req.session.e_acteur;

    // await Acteur.findById(acteur_id).then(async acteur => {
    //     if (!acteur) return response(res, 404, `Cet acteur n'existe pas !`);

        let results = {};
        const apikey = req.apikey.r_valeur;

        const atsgo_client_id = 166;
        const today = new Date().toISOString().split('T')[0]; 
        
        // HISTORY

        // const wallet_history_url  = `${process.env.ATSGO_URL_PORTEFEUILLE_HISTORY}?ApiKey=${apikey}&IdClient=${atsgo_client_id}&DateDebut=${today}&DateFin=${today}`;
        // console.log(wallet_history_url)
        // await fetch(wallet_history_url)
        //     .then(res => res.json())
        //     .then(async data => {
        //     if (data.status!=200) console.log(`Une erreur lors de la récupération de l'historique des portefeuilles !`)
        //     results['historiques'] = data.payLoad;
        // })

        // WALLET ACTIVES

        // const wallet_url  = `${process.env.ATSGO_URL_PORTEFEUILLE_BY_CLIENT}?ApiKey=${apikey}&IdClient=${atsgo_client_id}&Date=${today}`;
        // console.log(wallet_url)
        // await fetch(wallet_url)
        //     .then(res => res.json())
        //     .then(async data => {
        //     if (data.status!=200) console.log(`Une erreur lors de la récupération des portefeuilles !`)
        //     for(let portefeuille of data.payLoad) delete portefeuille.idClient
        //     results['portefeuilles'] = data.payLoad;
        // })

        // FONDS

        const fonds_url  = `${process.env.ATSGO_URL_FONDS}?ApiKey=${apikey}`;
        console.log(fonds_url)
        
        await fetch(fonds_url)
            .then(async res => res.json())
            .then(async data => {
            if (data.status!=200) console.log(`Une erreur lors de la récupération des fonds !`)
            results['fonds'] = data.payLoad;
        })
    
        // // VALEUR LIQUIDATIVE

        // const valeur_liquidative  = `${process.env.ATSGO_URL_VL_HISTORY}?ApiKey=${apikey}`;
    
        // await fetch(valeur_liquidative)
        //     .then(res => res.json())
        //     .then(data => {
        //     if (data.status!=200) console.log(`Une erreur lors de la récupération des VL !`)
        //     results['valeur_liquidatives'] = data.payLoad;
        // })

        return response(res, 200, `Resumé des informations du client`, results)

    // }).catch(err => next(err));
}

const cleanAllParticulier = async (req, res, next) => {
    await Client.Particulier.cleanAll().then(async particulier => {
        if (!particulier) return response(res, 200, `Nettoyage terminé`, null);
        await Acteur.cleanAll().then(async acteur => {
            return response(res, 200, `Nettoyage terminé`, null);
        }).catch(err => next(err)); 
    }).catch(err => next(err));
}

const resetPassword = async (req, res, next) => {

    const identifiant = req.body.identifiant;
    const telephone = req.body.telephone;

    await Client.Particulier.findByCompteTitre(identifiant).then(async particulier => {
        if (!particulier) return response(res, 404, `Entrez un compte titre valide svp !`);

        await Acteur.findByParticulierId(particulier.r_i).then(async acteur => {
            if (!acteur) return response(res, 404, `Cet acteur n'existe pas !`);

            if (!acteur.r_telephone_prp) return response(res, 400, `Numéro de téléphone principal introuvable !`);
            if (acteur.r_telephone_prp!=telephone) return response(res, 400, `Numéro de téléphone ne correspond pas !`);

            await OTP.clean(acteur.r_i, 2).catch(err => next(err));          // 1: activation, 2: reinitialisation

            const url = process.env.ML_SMSCI_URL;

            await Utils.aleatoireOTP().then(async code_otp => {
                await Utils.genearteOTP_Msgid().then(async msgid => {
                    await OTP.create(acteur.r_i, {msgid, code_otp, operation: 2}).then(async otp => {
                        await fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                identify: process.env.ML_SMS_ID,
                                pwd: process.env.ML_SMS_PWD,
                                fromad: "BAM CI",
                                toad: acteur.r_telephone_prp,
                                msgid: msgid,
                                text: `Votre code de vérification est : ${otp.r_code_otp}`
                            })
                        }).then(res => res.json())
                        .then(data => {
                            if (data!=1) return response(res, 400, `Envoi de message echoué`, data);
                                
                            console.log('code otp :', otp.r_code_otp);
                            return response(res, 200, `Message otp renvoyé avec succès`);
                        })
                    }).catch(err => next(err)); 
                }).catch(err => next(err));

            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const updatePassword = async (req, res, next) => {

    const {phone, cur_mdp, new_mdp} = req.body;

    await Utils.expectedParameters({phone, cur_mdp, new_mdp}).then(async () => {
        await Acteur.findByTelephone(phone).then(async acteur => {
            if (!acteur) return response(res, 404, `Acteur introuvable !`);
            await bcrypt.compare(cur_mdp, acteur.r_mdp).then(async valid => {
                if(!valid) return response(res, 401, `Code de réinitialisation incorrect !`);
                console.log(`Hashage du mot de passe`);
                await bcrypt.hash(new_mdp, 10).then(async hash => {
                    await Acteur.updatePassword(acteur.r_i, hash).then(async result => {
                        if (!result) return response(res, 400, `Une erreur s'est produite à la création du mot de passe !`);
                        return response(res, 200, `Mot de passe modifier avec succès`);
                    }).catch(err => next(err));
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => response(res, 400, err));

}

const getAllClientOperations = async (req, res, next) => {
    
    const ApiKey = req.apikey.r_valeur;
    const acteur_id = req.params.id;

    await Acteur.findById(acteur_id).then(async acteur => {
        await Client.Particulier.findById(acteur.e_particulier).then(async particulier => {

            const IdClient = particulier.r_atsgo_id_client; 
            const url = process.env.ATSGO_URL + process.env.URI_CLIENT_OPERATIONS + '?IdClient=' + IdClient + '&ApiKey=' + ApiKey;
            
            console.log(url);

            await fetch(url).then(res => res.json()).then(data => {
                if (data.status!=200) return response(res, 403, `Erreur lors de la récupération des opérations du client`)
                return response(res, 200, `Chargement des opérations du client`, data.payLoad);
            }).catch(err => next(err));

        }).catch(err => next(err));
    }).catch(err => next(err));

}

const validerOperation = async (req, res, next) => {

    const ApiKey = req.apikey.r_valeur;    

    const acteur_id = req.params.id;
    const {idOperationClient, idClient} = req.body;

    await Acteur.findById(acteur_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Acteur non trouvé !`);
        
        const url = process.env.ATSGO_URL + process.env.URI_CLIENT_OPERATION_VALIDATE + '?ApiKey=' + ApiKey;
        console.log(url)

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                idOperationClient,
                idClient
            })
        }).then(res => res.json()).then(async atsgo_data => {
            if (atsgo_data.status!=200) return response(res, 403, `Erreur lors du processus de validation`);  

            const notification = `Votre opération de souscription portant identifiant: ${idOperationClient}, à été validé avec succès.`;
            
            await Utils.genearteOTP_Msgid().then(async msgid => {
                await OTP.create(acteur_id, {msgid, code_otp:notification, operation: 3}).then(async message => {
                    fetch(process.env.ML_SMSCI_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            identify: process.env.ML_SMS_ID,
                            pwd: process.env.ML_SMS_PWD,
                            fromad: "BAM CI",
                            toad: acteur.r_telephone_prp,
                            msgid: msgid,
                            text: message.r_code_otp
                        })
                    }).then(res => res.json()).then(sms_data => {
                        if (sms_data!=1) return response(res, 403, `Envoi de message echoué`, sms_data);
                        return response(res, 200, `Validation de l'opération terminé`, atsgo_data);
                    }).catch(err => next(err)); 
                }).catch(err => next(err)); 
            }).catch(err => next(err)); 
        })
    }).catch(err => next(err));

}

module.exports = {
    getActeurResumes,
    cleanAllParticulier,
    resetPassword,
    updatePassword,
    getAllClientOperations,
    validerOperation, 
}