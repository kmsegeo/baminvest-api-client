const response = require('../middlewares/response');
const Acteur = require('../models/Acteur');
const { Particulier, Entreprise } = require('../models/Client');
const KYC = require('../models/KYC');

// PARTICULIER

const createParticulierKYC = async (req, res, next) => {

    console.log(`Ajout des paramètres KYC du client..`);

    await Acteur.findById(req.session.e_acteur).then(async acteur => {
        await Particulier.findById(acteur.e_particulier).then(async particulier => {
            if (!particulier) return response(res, 404, `Compte particulier inexistant !`);
            console.log(`Vérification de l'existance du KYC du client`);
            await KYC.Particulier.findByParticulierId(particulier.r_i).then(async exists => {
                if(exists) return response(res, 409, `KYC déjà renseigné !`);
                console.log(`Début de création du KYC`);
                await KYC.Particulier.create(particulier.r_i, {...req.body}).then(async kyc => {
                    if (!kyc) return response(res, 400, `Une erreur s'est produite !`);
                    await Acteur.updateStatus(acteur.r_i, 2).catch(err => next(err));
                    return response(res, 201, `Ajout de KYC terminé`, kyc);
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(err));    
    }).catch(err => next(err));
}

const getParticulierKYC = async (req, res, next) => {
    await Acteur.findById(req.session.e_acteur).then(async acteur => {
        await KYC.Particulier.findByParticulierId(acteur.e_particulier).then(kyc => {
            if (!kyc) return response(res, 404, `KYC non trouvé !`);
            return response(res, 200, `Chargement du KYC particulier`, kyc);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

// ENTREPRISE

const createEntrepriseKYC = async (req, res, next) => {
    console.log(`Ajout des paramètres KYC de l'entreprise..`);
    await Acteur.findById(req.session.e_acteur).then(async acteur => {
        if (!acteur) return response(res, 404, `Acteur non trouvé !`);
        await Entreprise.findById(acteur.e_entreprise).then(async entreprise => {
            if (!entreprise) return response(res, 404, `Compte entreprise inexistant !`);
            console.log(`Vérification de l'existance du KYC`);
            await KYC.Entreprise.findByEntrepriseId(entreprise.r_i).then(async exists => {
                if(exists) return response(res, 409, `Paramètre KYC déjà renseigné !`);
                console.log(`Début de création du KYC`);
                await KYC.Entreprise.create(entreprise.r_i, {...req.body}).then(async kyc => {
                    if (!kyc) return response(res, 400, `Une erreur s'est produite !`);
                    await Acteur.updateStatus(acteur.r_i, 2).catch(err => next(err));
                    return response(res, 201, `Ajout de KYC terminé`, kyc);
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(err));
    })
}

const getEntrepriseKYC = async (req, res, next) => {
    await Acteur.findById(req.session.e_acteur).then(async acteur => {
        await KYC.Entreprise.findByEntrepriseId(acteur.e_entreprise).then(kyc => {
            if (!kyc) return response(res, 404, `Aucun paramètre KYC renseigné !`);
            return response(res, 200, `Chargement du KYC entreprise`, kyc);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

module.exports = {
    createParticulierKYC,
    getParticulierKYC,
    createEntrepriseKYC,
    getEntrepriseKYC
}