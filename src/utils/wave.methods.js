const axios = require("axios");
const response = require("../middlewares/response");

const Wave = {

    async checkout(montant, mobile_payeur, url_erreur, url_succes, callback) {

        const url = process.env.WAVE_URL + process.env.URI_CHECKOUT_SESSION;

        const checkout_params = {
            amount: montant,
            currency: "XOF",
            restrict_payer_mobile: mobile_payeur ? '+' + mobile_payeur : null,
            error_url: url_erreur,
            success_url: url_succes,
        }

        axios.post(url, checkout_params, {
            headers: {
                'Authorization': `Bearer ${process.env.WAVE_API_API_ALL}`,
                'Content-Type': 'application/json',
            },
        })
        .then((resp) => {
            console.log('Initialisation de paiement wave terminé')
            callback(resp.data)
        }).catch((error) => { throw error });

    }, 

    async checkoutCheck(checkout_id, callback) {

        const url = process.env.WAVE_URL + process.env.URI_CHECKOUT_SESSION;

        axios.get(url + `/${checkout_id}`, { headers: {'Authorization': `Bearer ${process.env.WAVE_API_API_ALL}`} })
        .then((resp) => {
            console.log(`Vérification du paiement ${checkout_id} terminé`);
            callback(resp.data)
        }).catch((error) => { throw error });

    }
}

module.exports = Wave;