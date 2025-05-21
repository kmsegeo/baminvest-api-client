const response = require('../middlewares/response');
const Utils = require('../utils/utils.methods');
const Client = require('../models/Client');

const getAllTypeActeurs = async (req, res, next) => {
    console.log(`Récupération des types acteur..`);
    await Client.TypeActeur.findAll()
        .then(types => response(res, 200, `Liste des acteurs`, types))
        .catch(error => next(error));
}

const getCategorieCompte = async (req, res, next) => {
    const apikey = req.apikey.r_valeur;
    const url = process.env.ATSGO_URL + process.env.URI_CATEGORIE_COMPTE + '?ApiKey=' + apikey;
    await fetch(url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des categories compte !`, data.title)
        return response(res, 200, 'Liste des categorie compte', data.payLoad)
    }).catch(err => next(err));
}

const getCategorieClient = async (req, res, next) => {
    const apikey = req.apikey.r_valeur;
    const url = process.env.ATSGO_URL + process.env.URI_CATEGORIE_CLIENT + '?ApiKey=' + apikey;
    await fetch(url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des categories client !`, data.title)
        return response(res, 200, 'Liste des categorie client', data.payLoad)
    }).catch(err => next(err));
}

const getCategorieFatca = async (req, res, next) => {
    const apikey = req.apikey.r_valeur;
    const url = process.env.ATSGO_URL + process.env.URI_CATEGORIE_FATCA + '?ApiKey=' + apikey;
    await fetch(url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des categories FATCA !`, data.title)
        return response(res, 200, 'Liste des categorie FATCA', data.payLoad)
    }).catch(err => next(err));
}

const getTypeClient = async (req, res, next) => {
    const apikey = req.apikey.r_valeur;
    const url = process.env.ATSGO_URL + process.env.URI_TYPE_CLIENT + '?ApiKey=' + apikey;
    await fetch(url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des types de client !`, data.title)
        return response(res, 200, 'Liste des type de clients', data.payLoad)
    }).catch(err => next(err));
}

const getTypeCompteInvest = async (req, res, next) => {
    const apikey = req.apikey.r_valeur;
    const url = process.env.ATSGO_URL + process.env.URI_TYPE_COMPTE + '?ApiKey=' + apikey;
    await fetch(url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des types de compte !`, data.title)
        return response(res, 200, 'Liste des type de compte', data.payLoad)
    }).catch(err => next(err));
}

const getTypePiece = async (req, res, next) => {
    const apikey = req.apikey.r_valeur;
    const url = process.env.ATSGO_URL + process.env.URI_TYPE_PIECE + '?ApiKey=' + apikey;
    await fetch(url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des types de pièce !`, data.title)
        return response(res, 200, 'Liste des type de pièce', data.payLoad)
    }).catch(err => next(err));
}

const getPays = async (req, res, next) => {
    const apikey = req.apikey.r_valeur;
    const url = process.env.ATSGO_URL + process.env.URI_PAYS + '?ApiKey=' + apikey;
    await fetch(url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des pays !`, data.title)
        return response(res, 200, 'Liste des pays', data.payLoad)
    }).catch(err => next(err));
}

const getOrigineRevenu = async (req, res, next) => {
    const apikey = req.apikey.r_valeur;
    const url = process.env.ATSGO_URL + process.env.URI_ORIGINE_REVENU + '?ApiKey=' + apikey;
    await fetch(url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des origines de revenu !`, data.title)
        return response(res, 200, 'Liste des origines de revenu', data.payLoad)
    }).catch(err => next(err));
}

const getSecteurActivite = async (req, res, next) => {
    const apikey = req.apikey.r_valeur;
    const url = process.env.ATSGO_URL + process.env.URI_SECTEUR_ACTIVITE + '?ApiKey=' + apikey;
    await fetch(url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des secteurs d'activité !`, data.title)
        return response(res, 200, 'Liste des secteurs d\'activité', data.payLoad)
    }).catch(err => next(err));
}

module.exports = {
    getAllTypeActeurs,
    getCategorieCompte,
    getCategorieClient,
    getCategorieFatca,
    getTypeClient,
    getTypeCompteInvest,
    getTypePiece,
    getPays,
    getOrigineRevenu,
    getSecteurActivite
}