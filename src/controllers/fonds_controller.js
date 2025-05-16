const { error } = require('winston');
const response = require('../middlewares/response');
const Fonds = require('../models/Fonds');
const Utils = require('../utils/utils.methods');

const getAllFonds = async (req, res, next) => {

    console.log(`Chargement des fonds..`)
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);

    const apikey = req.apikey.r_valeur;
    const url  = `${process.env.ATSGO_URL + process.env.URI_FONDS}?ApiKey=${apikey}`;
    console.log(url);

    fetch(url)
        .then(async res => res.json())
        .then(async data => {
            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des fonds !`)
            return response(res, 200, `Chargement de fonds terminé`, data.payLoad);
        })
    
        // let i = 0;
        // let fonds = [];
        // for (let payLoad of data.payLoad) {
        //     await Utils.generateCode(Fonds.codePrefix, Fonds.tableName, Fonds.codeColumn, Fonds.codeSpliter).then(async ref => {
        //         console.log(`Vérification de la reférence du FCP`);
        //         await Fonds.findByIntitule(payLoad.code).then(async fd => {
        //             if (!fd) {
        //                 console.log(`Début de création du FCP`);
        //                 await Fonds.create(ref, {
        //                     intitule: payLoad.code, 
        //                     description: payLoad.libelle
        //                     // commission_souscription: , 
        //                     // commission_sortie: ,
        //                 }).then(async fd_new => {
        //                     fonds.push(fd_new);
        //                 }).catch(err => next(err));
        //                 await Utils.sleep(500);
        //             } else {
        //                 fonds.push(fd);
        //             }
        //             i++;
        //         }).catch(error => next(error));
        //     }).catch(err => next(err));
        // }
}

const getAllValeurLiquidatives = async (req, res, next) => {

    console.log(`Chargement des valeurs liquidatives..`)
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);

    const apikey = req.apikey.r_valeur;
    const url  = `${process.env.ATSGO_URL + process.env.URI_VLS}?ApiKey=${apikey}`;
    console.log(url);

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des fonds !`)
            return response(res, 200, `Chargement des valeurs liquidatives`, data.payLoad)
        })
}

const getVlFonds = async (req, res, next) => {

    console.log(`Chargement des fonds..`)
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);
        
    const apikey = req.apikey.r_valeur;
    const fonds_url  = `${process.env.ATSGO_URL + process.env.URI_FONDS}?ApiKey=${apikey}`;
    const vls_url  = `${process.env.ATSGO_URL + process.env.URI_VLS}?ApiKey=${apikey}`;

    console.log(fonds_url);
    await fetch(fonds_url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des fonds !`, data.title)
        const fonds = data.payLoad;

        console.log(`Chargement des valeurs liquidatives`)
        console.log(vls_url);
        await fetch(vls_url).then(res => res.json()).then(data => {
            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des valeurs liquidatives !`, data.title)
            
            console.log(`Calcul des valeurs liquidatives de fonds`)
            const vls = data.payLoad;
            let result = []; let i = 0;
            
            for (let f of fonds) {
                
                let analytics = {};
                analytics['idFcp'] = f.idFcp;
                analytics['libelle'] = f.libelle;

                let vl = {};
                let n = 0;
                for (let d of vls) {
                    if (f.idFcp==d.idFcp) {
                        vl['n-'+n] = Number(d.vl);
                        if (n==0) analytics['valeur_liquidative'] = Number((d.vl).toFixed(2));
                        n++;
                    }
                    if (n==2) break;
                }
                
                analytics['progression'] = ((vl['n-0'] - vl['n-1'])/vl['n-1']).toFixed(4);
                result[i] = analytics;
                i++;
            }

            return response(res, 200, `Chargement des fonds terminé`, fonds, result)
        }).catch(error => next(error))
    }).catch(error => next(error))
}

const calculateOperationCost = async (req, res, next) => {



}

const runSimulator = async (req, res, next) => {

    const {versement_initial, versement_periodique, horizon, rendement_attendu} = req.body;
    const frais = 14/100;
    const taux = Number(rendement_attendu)/100;
    const taux_mensuel = taux/12;
    const horizon_mois = Number(horizon) * 12;
    
    const versement_total = Number(versement_periodique) * horizon_mois;
    // const revenu_mensuel_net = ((10000000 - (versement_initial * Math.pow(1 + taux_mensuel, horizon_mois).toFixed(2))) * taux_mensuel) / (Math.pow(1 + taux_mensuel, horizon_mois).toFixed(2) - 1);
    const revenu_mensuel_net = Number(( (versement_initial + versement_periodique) * taux_mensuel) .toFixed(2) );
    // const revenu_net = Number(((Number(versement_initial) + versement_total) * Number(taux_mensuel)).toFixed(2));
    const revenu_net = 0;
    const revenu_moyen_mensuel = 0;
    const valeur_final_placement = Number(versement_initial) + Number(versement_total) + Number(revenu_net);

    return response(res, 200, `Calcul simulateur terminé`, {
        versement_initial,
        horizon_mois,
        taux,
        versement_total,
        revenu_mensuel_net,
        revenu_net,
        revenu_moyen_mensuel,
        valeur_final_placement
    })
}

module.exports = {
    getAllFonds,
    getAllValeurLiquidatives,
    getVlFonds,
    calculateOperationCost,
    runSimulator
} 