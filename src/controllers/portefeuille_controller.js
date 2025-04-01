const response = require('../middlewares/response');

const getClientProtefeuilles = async (req, res, next) => {

    console.log('Chargement du du portefeuilleclient...')

    const apikey = req.apikey.r_valeur;
    const id_client = 166;
    const date = new Date().getFullYear() + '-'  + new Date().getMonth() + '-' + new Date().getDate();

    const url = process.env.ATSGO_URL_CLIENT_PORTEFEUILLE + '?ApiKey=' + apikey + '&IdClient=' + id_client + '&Date=' + date;
    console.log(url)

    await fetch(url)
        .then(async res => res.json())
        .then(async data => {
            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des portefeuilles !`);

            let portefeuille_valeur_total = 0;

            for(let payLoad of data.payLoad) {
                portefeuille_valeur_total += Number(payLoad.valorisation);
                delete payLoad.id;
                delete payLoad.idClient;
            }

            return response(res, 200, 'Chargement du protefeuille terminé', data.payLoad, {portefeuille_valeur_total});
        })
}

const getOnePortefeuille = async (req, res, next) => {

}

const getAllPortefeuilleValue = async (req, res, next) => {

}

const getPortefeuilleEvolution = async (req, res, next) => {

}

const getAllPortefeuilleAnnualValue = async (req, res, next) => {

}

module.exports = {
    getClientProtefeuilles,
    getOnePortefeuille,
    getAllPortefeuilleValue,
    getPortefeuilleEvolution,
    getAllPortefeuilleAnnualValue
}