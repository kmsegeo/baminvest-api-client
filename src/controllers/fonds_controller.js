const response = require('../middlewares/response');
const Fonds = require('../models/Fonds');
const Utils = require('../utils/utils.methods');

const getAllFonds = async (req, res, next) => {

    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);

    const apikey = req.apikey.r_valeur;
    const url  = `${process.env.ATSGO_URL + process.env.URI_FONDS}?ApiKey=${apikey}`;

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

    const apikey = req.apikey.r_valeur;
    const url  = `${process.env.ATSGO_URL + process.env.URI_VLS}?ApiKey=${apikey}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des fonds !`)

            for (let payLoad of data.payLoad) {
                
            }

            return response(res, 200, `Chargement des valeurs liquidatives`, data.payLoad)
        })
}

const getVlFonds = async (req, res, next) => {

    console.log(`Calcul des valeurs liquidatives de fonds..`)
    
    const apikey = req.apikey.r_valeur;
    const fonds_url  = `${process.env.ATSGO_URL + process.env.URI_FONDS}?ApiKey=${apikey}`;
    const vls_url  = `${process.env.ATSGO_URL + process.env.URI_VLS}?ApiKey=${apikey}`;

    await fetch(fonds_url).then(async res => res.json()).then(async data => {
        if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des fonds !`)
        const fonds = data.payLoad;
        await fetch(vls_url).then(res => res.json()).then(data => {
            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des valeurs liquidatives !`)
            const vls = data.payLoad;
            let result = [];
            let i = 0;
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
                
                analytics['progression'] = ((vl['n-0'] - vl['n-1'])/vl['n-1']).toFixed(4) + '%';
                result[i] = analytics;
                i++;
            }

            return response(res, 200, `Calcul des valeurs liquidatives des fonds terminé`, fonds, result)
        })
    })
}

module.exports = {
    getAllFonds,
    getAllValeurLiquidatives,
    getVlFonds,
}