const response = require('../middlewares/response');
const Fonds = require('../models/Fonds');
const Utils = require('../utils/utils.methods');

const getAllFonds = async (req, res, next) => {

    const apikey = req.apikey.r_valeur;
    const url  = `${process.env.ATSGO_URL_FONDS}?ApiKey=${apikey}`;

    await fetch(url)
        .then(async res => res.json())
        .then(async data => {
            if (data.status!=200) return response(res, data.status, `Une erreur lors de la récupération des fonds !`)
            let i = 0;
            let fonds = [];
            for (let payLoad of data.payLoad) {
                await Utils.generateCode(Fonds.codePrefix, Fonds.tableName, Fonds.codeColumn, Fonds.codeSpliter).then(async ref => {
                    console.log(`Vérification de la reférence du FCP`);
                    await Fonds.findByIntitule(payLoad.code).then(async fd => {
                        if (!fd) {
                            console.log(`Début de création du FCP`);
                            await Fonds.create(ref, {
                                intitule: payLoad.code, 
                                description: payLoad.libelle
                                // commission_souscription: , 
                                // commission_sortie: ,
                            }).then(async fd_new => {
                                fonds.push(fd_new);
                            }).catch(err => next(err));
                            await Utils.sleep(1000);
                        } else {
                            fonds.push(fd);
                        }
                        i++;
                    }).catch(error => next(error));
                }).catch(err => next(err));
            }
            return response(res, 200, `Chargement de fonds terminé`, fonds)
        })
    
    // await Fonds.findAll()
    //     .then(fonds => response(res, 200, `Chargement des fonds`, fonds))
    //     .catch(err => next(err));
}

module.exports = {
    getAllFonds
}