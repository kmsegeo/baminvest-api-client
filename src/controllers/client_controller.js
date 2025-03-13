const response = require("../middlewares/response");
const Acteur = require("../models/Acteur");
const OTP = require("../models/OTP");
const Utils = require("../utils/utils.methods");
const bcrypt = require('bcryptjs');

const resetPassword = async (req, res, next) => {

    const identifiant = req.body.identifiant;
    const telephone = req.body.telephone;

    await Acteur.findByEmail(identifiant).then(async acteur => {
        if (!acteur) return response(res, 404, `Cet acteur n'existe pas !`);

        // await OTP.findByActeurId(acteur.r_i).then(async otp => {
        if (!acteur.r_telephone_prp) return response(res, 400, `Numéro de téléphone principal introuvable !`);
        if (acteur.r_telephone_prp!=telephone) return response(res, 400, `Numéro de téléphone non conforme !`);

        await OTP.clean(acteur.r_i, 2).catch(err => next(err));          // 1: activation, 2: reinitialisation

        const url = "https://sms.sms-ci.com/SELFGATE_WEB/FR/data.awp"

        await Utils.aleatoireOTP().then(async code_otp => {
            await Utils.genearteOTP_Msgid().then(async msgid => {
                await OTP.create(acteur.r_i, {msgid, code_otp, operation: 2}).then(async otp => {
                    // await fetch(url, {
                    //     method: "POST",
                    //     headers: {
                    //         "Content-Type": "application/json",
                    //     },
                    //     body: JSON.stringify({
                    //         identify: "test@mediasoftci.com",
                    //         pwd: "12345",
                    //         fromad: "BAM CI",
                    //         toad: acteur.r_telephone_prp,
                    //         msgid: msgid,
                    //         text: `Votre code de vérification est : ${otp.r_code_otp}`
                    //     })
                    // }).then(res => res.json())
                    // .then(data => {
                    //     if (data!=1) return response(res, 400, `Envoi de message echoué`, data);
                            return response(res, 200, `Message otp renvoyé avec succès`, otp);
                    // })
                }).catch(err => next(err)); 
            }).catch(err => next(err));

        }).catch(err => next(err));
        // }).catch(err => next(err));
    }).catch(err => next(err));
}

const updatePassword = async (req, res, next) => {

    // const acteur_id = req.params.acteurId;
    const {identifiant, cur_mdp, new_mdp} = req.body;

    await Utils.expectedParameters({identifiant, cur_mdp, new_mdp}).then(async () => {
        await Acteur.findByEmail(identifiant).then(async acteur => {
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

module.exports = {
    resetPassword,
    updatePassword
}