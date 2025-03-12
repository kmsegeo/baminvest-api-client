const response = require("../middlewares/response");
const Acteur = require("../models/Acteur");
const OTP = require("../models/OTP");
const Utils = require("../utils/utils.methods");

const resetPassword = async (req, res, next) => {

    const acteur_id = req.session.e_acteur;
    const telephone = req.body.telephone;

    await Acteur.findById(acteur_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Cet acteur n'existe pas !`);

        await OTP.findByActeurId(acteur_id).then(async otp => {
            if (!acteur.r_telephone_prp) return response(res, 400, `Numéro de téléphone principal introuvable !`);
            if (acteur.r_telephone_prp!=telephone) return response(res, 400, `Numéro de téléphone non conforme !`);

            await OTP.clean(acteur_id, 2).catch(err => next(err));      // 1: activation, 2: reinitialisation

            const url = "https://sms.sms-ci.com/SELFGATE_WEB/FR/data.awp"

            await Utils.aleatoireOTP().then(async code_otp => {
                await Utils.genearteOTP_Msgid().then(async msgid => {
                    await OTP.create(acteur_id, {msgid, code_otp, operation: 2}).then(async otp => {
                        await fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                identify: "test@mediasoftci.com",
                                pwd: "12345",
                                fromad: "BAM CI",
                                toad: acteur.r_telephone_prp,
                                msgid: otp.msgid,
                                text: `Votre code de vérification est : ${code_otp}`
                            })
                        }).then(res => res.json())
                        .then(data => {
                            if (data!=1) return response(res, 400, `Envoi de message echoué`, data);
                                return response(res, 200, `Message otp renvoyé avec succès`, otp);
                        })
                    }).catch(err => next(err)); 
                }).catch(err => next(err));

            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

module.exports = {
    resetPassword,
}