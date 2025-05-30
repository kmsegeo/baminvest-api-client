const response = require('../middlewares/response');
const Acteur = require('../models/Acteur');
const { Particulier } = require('../models/Client');

const getClientProtefeuilles = async (req, res, next) => {

    console.log('Chargement des portefeuilles client...');
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`);

    await Acteur.findById(req.session.e_acteur).then(async acteur => {
        await Particulier.findById(acteur.e_particulier).then( async particulier => {
            
            const id_client = particulier.r_atsgo_id_client;

            const apikey = req.apikey.r_valeur;
            const date = new Date().getFullYear() + '-'  + new Date().getMonth() + '-' + new Date().getDate();

            const url = process.env.ATSGO_URL + process.env.URI_CLIENT_PORTEFEUILLES + '?ApiKey=' + apikey + '&IdClient=' + id_client + '&Date=' + date;
            console.log(url)

            await fetch(url).then(async res => res.json())
            .then(async data => {

                if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des portefeuilles !`);

                let result = {};
                let portefeuille_valeur_total = 0;

                for(let payLoad of data.payLoad) {
                    portefeuille_valeur_total += Number(payLoad.valorisation);
                    delete payLoad.id;
                    delete payLoad.idClient;
                }

                let i = 0;
                let fonds = []
                for(let payLoad of data.payLoad) {
                    let portefeuille = {}
                    portefeuille['fonds'] = payLoad.libelle
                    portefeuille['montant'] = Number(payLoad.valorisation);
                    portefeuille['pourcentage'] = Number(((Number(payLoad.valorisation) * 100) / portefeuille_valeur_total).toFixed(2));
                    fonds[i] = portefeuille;
                    // for (let actif of payLoad.repartitionClassesActifs) delete actif.libelle
                    // fonds[i].repartition_actifs = payLoad.repartitionClassesActifs;
                    // delete payLoad.repartitionClassesActifs
                    i++;
                }
                
                result.repartition_fonds = fonds;
                result.portefeuille_valeur_total = portefeuille_valeur_total;

                return response(res, 200, 'Chargement du protefeuille terminé', data.payLoad, result);
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const getPortefeuilleEvolution = async (req, res, next) => {
    
    console.log('Chargement de l\'evolution des portefeuilles..')
    if (req.headers.op_code!='TYOP-003') return response(res, 403, `Type opération non authorisé !`)
    
    const apikey = req.apikey.r_valeur;

    const IdFcp = req.query.IdFcp;
    const periode = req.query.Date;

    await Acteur.findById(req.session.e_acteur).then(async acteur => {
        await Particulier.findById(acteur.e_particulier).then( async particulier => {
            
            const id_client = particulier.r_atsgo_id_client;
            
            const url = process.env.ATSGO_URL + process.env.URI_CLIENT_HIST_PORTEFEUILLES + '?ApiKey=' + apikey + '&IdFcp='+ IdFcp +'&IdClient=' + id_client + '&Date=' + periode;
            console.log(url)

            await fetch(url).then(async res => res.json())
            .then(async data => {
                if (data.status!=200) return response(res, 403, `Une erreur lors de la récupération des portefeuilles !`);

                return response(res, 200, 'Chargement des évolutions terminé', data.payLoad);

            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

module.exports = {
    getClientProtefeuilles,
    getPortefeuilleEvolution,
}