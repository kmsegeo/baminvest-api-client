const { error } = require('winston');
const response = require('../middlewares/response');
const Fonds = require('../models/Fonds');
const Utils = require('../utils/utils.methods');
const Acteur = require('../models/Acteur');
const { Particulier } = require('../models/Client');
const Atsgo = require('../utils/atsgo.methods');

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

const calculateOperationFees = async (req, res, next) => {

    console.log('Calcul des frais de l\'opération..')

    const apikey = req.apikey.r_valeur;
    const {idFcp, montant} = req.body;
    const acteur_id = req.session.e_acteur;

    Utils.expectedParameters({idFcp, montant}).then(async () => {

        console.log(`Vérification de la valleur liquidative du fonds`)
        const fonds_url = `${process.env.ATSGO_URL + process.env.URI_FONDS}?ApiKey=${apikey}`;
        console.log(fonds_url);

        await fetch(fonds_url).then(async res => res.json()).then(async data => {
            if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des fonds !`);
            
            let fonds = null;

            for (let f of data.payLoad) 
                if (f.idFcp==idFcp) fonds = f;

            if (!fonds)
                return response(res, 404, `Fonds introuvable !`);

            if (Number(montant) < Number(fonds.vl))
                return response(res, 403, `Le montant attendu est inférieur à la valeur liquidative actuelle !`);
                
            console.log(`Recupération des données client`)
            await Acteur.findById(acteur_id).then(async acteur => {
                await Particulier.findById(acteur.e_particulier).then(async particulier => {
                    
                    const idClient = particulier.r_atsgo_id_client;
                    
                    await Atsgo.getOperationFees(apikey, {
                        idClient,
                        idFcp,
                        idTypeOperation: 2,         // 2:Souscription - 3:Rachat
                        montant
                    }, async (fees) => {
                        return response(res, 200, `Chargement ddes frais d'opération`, fees);
                    })

                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(err)); 
    }).catch(err => response(res, 400, err));
}

const calculateVersementSimulator = async (req, res, next) => {

    const {versement_initial, horizon, rendement_attendu, placement_final} = req.body;
    
    const vInit = versement_initial;
    const vFinal = placement_final;
    const vHorizon = horizon;
    const vTaux = rendement_attendu;

    let dTaux       = parseFloat(vTaux/100);
    let dTauxM      = dTaux/12;
    let mHorizon    = parseInt(vHorizon*12);

    console.log("Initiale " + vInit);
    console.log("Placement " + vFinal);
    console.log("Horizon An " + vHorizon);
    console.log("Taux% " + vTaux);
    console.log("TauxM " + dTaux);
    console.log("Horizon Mois " + mHorizon);
    console.log("Taux intert mensuel " + dTaux/12 );

    const mensuel = ( ( vFinal - ( vInit * Math.pow( 1 + dTauxM ,mHorizon).toFixed(2) ) ) * dTauxM ) / (Math.pow(1 + dTauxM,mHorizon).toFixed(2) - 1);

    return response(res, 200, `Calcul versement periodique terminé`, { mensuel });
}

const calculateSimulator = async (req, res, next) => {

    const {versement_initial, versement_recurrent, versement_periodique, horizon_période, horizon, horizon_mois, rendement_attendu} = req.body;

    //Versement Initial
    const onceOnlyDeposit = versement_initial;
    //Versement Recurrent
    const recurringDeposit = versement_recurrent;
    //Versement Période - Recurrence de versement :: Y=1 S=2 T=4 M=12
    const recurringDepositPeriod = versement_periodique;
    //Horizon Période Y=An, M= Mensuel
    const investmentPeriodTerm = horizon_période;
    //Horizon si hP="Y"
    const h = horizon;
    //Horizon Mensuel si hP="M"  3/6/9/12
    const hM = horizon_mois;
    //Période sélectionné
    const investmentPeriod = (investmentPeriodTerm=="Y") ? h : hM;
    //Taux
    const depositYearlyGrowth = rendement_attendu;
    
    // let depositResult = calculateDeposit(onceOnlyDeposit, recurringDeposit, recurringDepositPeriod, investmentPeriod, investmentPeriodTerm, depositYearlyGrowth);

    let r = {
        versement_initial: 0,
        versement_total: 0,
        revenus_net: 0,
        valeur_finale: 0,
        revenus_moyen: 0,
        datasets: null,
    },

    l = [],
    s = 0,
    c = 0;

    let overall = onceOnlyDeposit;
    let prevOverall = 0;
    let yearlyGrowth = 0;
    let overallGrowth = 0;

    let numberOfMonthsTotal = 0;
    let numberOfMonths      = 0;

    if (investmentPeriod > 0) {

        let interval;
        if(recurringDepositPeriod=="M") {
            interval = 12;
        } else if(recurringDepositPeriod=="T") {
            interval = 4;
        } else if(recurringDepositPeriod=="S") {
            interval = 2;
        } else {
            interval = 1;
        }

        if(investmentPeriodTerm=="Y") {
            numberOfMonthsTotal     = investmentPeriod;
            numberOfMonths          = numberOfMonthsTotal * interval;
        } else {
            numberOfMonthsTotal     = parseFloat(investmentPeriod/12);
            numberOfMonths          = numberOfMonthsTotal * interval;
        }

        let enAnnee = false; // Pour l'affichage du libellé Année/Mois.. sur le graphe
        if (investmentPeriodTerm=="Y") {
            if (recurringDepositPeriod=="M") {
                if(investmentPeriod>4) { enAnnee = true; xAxisLabel = "Années" } else { xAxisLabel = "Mois";  }
            } else if(recurringDepositPeriod=="T") {
                if(investmentPeriod>10) { enAnnee = true; xAxisLabel = "Années" } else { xAxisLabel = "Trimestre(s)";  }
            } else if(recurringDepositPeriod=="S") {
                if(investmentPeriod>20) { enAnnee = true; xAxisLabel = "Années" } else { xAxisLabel = "Semestre(s)";  }
            } else {
                xAxisLabel = "Années";
            }
        } else {
            enAnnee = false;
            if (recurringDepositPeriod=="M") { xAxisLabel = "Mois"; }
            if (recurringDepositPeriod=="T") { xAxisLabel = "Trimestre(s)"; }
            if (recurringDepositPeriod=="S") { xAxisLabel = "Semestre(s)"; }
            if (recurringDepositPeriod=="Y") { xAxisLabel = "Année(s)"; }

        }

        let monthlyGrowthInPercent  = Math.pow( 1 + (depositYearlyGrowth/100) , 1/interval ) -1;

        for (let currentMonth = 1; currentMonth <= numberOfMonths ; currentMonth++) {

            let revenus_net      = overall * monthlyGrowthInPercent;
            yearlyGrowth    += revenus_net;
            overall         = overall + revenus_net;

            if(enAnnee) {
                //Si en Année, le modulo permet d'afficher que les Mois/trimetre/Semestre
                //de la période et non tous les mois.
                if (  currentMonth % interval === 0 ) {
                    overallGrowth +=yearlyGrowth;
                    let y = {
                        versement_initial: onceOnlyDeposit,
                        versements_recurrents: (recurringDeposit * interval),
                        revenus_net: yearlyGrowth,
                        versements_recurrents_cumule: recurringDeposit * currentMonth,
                        revenus_net_cumule: overallGrowth,
                        valeur_finale_cumule: overall
                    };
                    prevOverall = overall;
                    yearlyGrowth = 0;
                    l.push(y)
                }
            } else {
                // Affichage en mois, on affiche le nb total de mois sur la graphe
                overallGrowth +=yearlyGrowth;
                let y = {
                    versement_initial: onceOnlyDeposit,
                    versements_recurrents: (recurringDeposit * interval),
                    revenus_net: yearlyGrowth,
                    versements_recurrents_cumule: recurringDeposit * currentMonth,
                    revenus_net_cumule: overallGrowth,
                    valeur_finale_cumule: overall
                };
                prevOverall = overall;
                yearlyGrowth = 0;
                l.push(y)
            }

            overall += recurringDeposit;
        }

    } else {
        return response(res, 400, `Error`, r);
    }

    r.datasets = l, 
    r.valeur_finale = overall, 
    r.revenus_net = overallGrowth, 
    r.versement_initial = onceOnlyDeposit, 
    r.versement_total = recurringDeposit * numberOfMonths ;
    r.revenus_moyen = await calculateGrowthAverrage(recurringDepositPeriod, h, hM, investmentPeriodTerm, r);

    return response(res, 200, `Calcul simulateur terminé`, r);
}

async function calculateGrowthAverrage(vP, h, hM, hP, t) {

    let p = (hP=="Y") ? h : hM;
    // Revenu Total sur la période
    let rT = t.revenus_net;
    //Libellé
    let rMLabel = "";
    // Revenu
    let rM = 0;

    if(hP=="Y") {
        //Horizon en Année
        if(vP=="M") {
            rMLabel = "Revenus Mensuel Moyen";
            rM = rT / (p*12);
        } else if (vP=="T") {
            rMLabel = "Revenus Trimestriel Moyen";
            rM = rT / (p*4);
        } else if (vP=="S") {
            rMLabel = "Revenus Semestriel Moyen";
            rM = rT / (p*2);
        } else {
            rMLabel = "Revenus Annuel Moyen";
            rM = rT / h;
        }
    } else {
        //Horizon en Mois
        if(vP=="M") {
            //Revenue Total / Nb de mois saisie, car Versement Périodique en Mois
            rMLabel = "Revenus Mensuel Moyen";
            rM = rT/p;
        } else if (vP=="T") {
            //Revenue Total / Nb de mois saisie / 3, car Versement Périodique en Trimestre et  T=3 mois
            rMLabel = "Revenus Trimestriel Moyen";
            rM = rT / (p/3);
        } else if (vP=="S") {
            //Revenue Total / Nb de mois saisie / 6, car Versement Périodique en Semestre et  1 semestre = 6mois
            rMLabel = "Revenus Semestriel Moyen";
            rM = rT / (p/6);
        } else {
            //Revenue Total / Nb de mois saisie / 12, car Versement Périodique en Année et  1 An = 12mois
            rMLabel = "Revenus Annuel Moyen";
            rM = rT / (p/12);
        }
    }

    return rM;
}

module.exports = {
    getAllFonds,
    getAllValeurLiquidatives,
    getVlFonds,
    calculateOperationFees,
    calculateVersementSimulator,
    calculateSimulator
} 