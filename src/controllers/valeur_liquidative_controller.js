const response = require('../middlewares/response');

const getAllValeurLiquidatives = async (req, res, next) => {

    const apikey = req.apikey.r_valeur;
    const url  = `${process.env.ATSGO_URL + process.env.URI_VLS}?ApiKey=${apikey}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status!=200) return response(res, data.status,`Une erreur lors de la récupération des fonds !`)
            return response(res, 200, `Chargement des valeurs liquidatives`, data.payLoad)
        })
}

module.exports = {
    getAllValeurLiquidatives
}