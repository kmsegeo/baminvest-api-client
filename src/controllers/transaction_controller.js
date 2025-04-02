const response = require("../middlewares/response");

const getTransactionHistorique = async (req, res, next) => {
    
    console.log('Chargement de l\'historique des transactions...')
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);
    
    const apikey = req.apikey.r_valeur;
    const id_client = 166;
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
}

module.exports = {
    getTransactionHistorique
}