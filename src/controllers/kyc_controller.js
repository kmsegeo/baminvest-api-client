const { default: response } = require('../middlewares/response');
const KYC = require('../models/KYC');

// PARTICULIER

const createParticulierKYC = async (req, res, next) => {

    console.log(`Ajout des paramètres KYC du client..`);
    const particulierId = req.params.id;

    console.log(`Vérification de l'existance du KYC du client`);
    await KYC.Particulier.findByParticulierId(particulierId).then(async exists => {
        if(exists) return response(res, 409, `KYC déjà renseigné !`);
        console.log(`Début de création du KYC`);
        await KYC.Particulier.create(particulierId, {...req.body}).then(kyc => {
            if (!kyc) return response(res, 400, `Une erreur s'est produite !`);
            return response(res, 201, `Ajout de KYC terminé`, kyc);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const getParticulierKYC = async (req, res, next) => {

    await KYC.Particulier.findByParticulierId(req.params.id).then(kyc => {
        if (!kyc) return response(res, 404, `KYC non trouvé !`);
        return response(res, 200, `Chargement du KYC particulier`, kyc);
    }).catch(err => next(err));
}

// ENTREPRISE

const createEntrepriseKYC = async (req, res, next) => {

    console.log(`Ajout des paramètres KYC de l'entreprise..`);
    const entrepriseId = req.params.id;

    console.log(`Vérification de l'existance du KYC`);
    await KYC.Entreprise.findByEntrepriseId(entrepriseId).then(async exists => {
        if(exists) return response(res, 409, `Aucun paramètre KYC renseigné !`);
        console.log(`Début de création du KYC`);
        await KYC.Entreprise.create(entrepriseId, {...req.body}).then(kyc => {
            if (!kyc) return response(res, 400, `Une erreur s'est produite !`);
            return response(res, 201, `Ajout de KYC terminé`, kyc);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const getEntrepriseKYC = async (req, res, next) => {

    await KYC.Entreprise.findByEntrepriseId(req.params.id).then(kyc => {
        if (!kyc) return response(res, 404, `Aucun paramètre KYC renseigné !`);
        return response(res, 200, `Chargement du KYC entreprise`, kyc);
    }).catch(err => next(err));
}

module.exports = {
    createParticulierKYC,
    getParticulierKYC,
    createEntrepriseKYC,
    getEntrepriseKYC
}