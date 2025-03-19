const response = require('../middlewares/response');
const { Particulier, Entreprise } = require('../models/Client');
const KYC = require('../models/KYC');

// PARTICULIER

const createParticulierKYC = async (req, res, next) => {

    console.log(`Ajout des paramètres KYC du client..`);
    const particulier_id = req.params.particulierId;
    
    await Particulier.findById(particulier_id).then(async particulier => {
        if (!particulier) return response(res, 404, `Compte particulier inexistant !`);
        console.log(`Vérification de l'existance du KYC du client`);
        await KYC.Particulier.findByParticulierId(particulier.r_i).then(async exists => {
            if(exists) return response(res, 409, `KYC déjà renseigné !`);
            console.log(`Début de création du KYC`);
            await KYC.Particulier.create(particulier.r_i, {...req.body}).then(async kyc => {
                if (!kyc) return response(res, 400, `Une erreur s'est produite !`);
                // await Acteur.updateStatus(acteur.r_i, 2).catch(err => next(err));
                return response(res, 201, `Ajout de KYC terminé`, kyc);
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));    
}

const updateParticulierKYC = async (req, res, next) => {

    console.log(`MAJ des paramètres KYC du client..`);
    
    const particulier_id = req.params.particulierId;
    const {autres_contexte_ouv, contexte_ouverture_compte, raisons_ouverture_compte, ouverture_compte, lien_parente_sgo, civilite, nom_prenom_titulaire, date_naissance, pays_naissance, pays_residence, situation_matrimoniale, telephone, email, situation_habitat, categorie_professionnelle, autres_categorie_prof, profession, employeur, nbr_enfants, langue_preferee, instrument_paiement_privilige, origine_ressources_investies, autres_origines_ressources, tranche_revenus, autres_actifs, autres_actifs_preciser, autres_comptes_bridge, comptes_bridges, banques_relations, activites_politiques, preciser_activite_politiq, proche_politicien, preciser_proche_politicien} = req.body
    
    await Particulier.findById(particulier_id).then(async particulier => {
        if (!particulier) return response(res, 404, `Compte particulier inexistant !`);

        console.log(`Vérification de l'existance du KYC du client`);
        await KYC.Particulier.findByParticulierId(particulier.r_i).then(async kyc => {
            if(!kyc) return response(res, 409, `KYC pas encore enregistré !`);

            console.log(`Début de mise à jour du KYC`);
            await KYC.Particulier.update(particulier.r_i, {...req.body}).then(async kyc_updated => {
                if (!kyc) return response(res, 400, `Une erreur s'est produite !`);
                const newLocal = `Mise à jour du KYC terminé`;
                return response(res, 200, newLocal, kyc_updated);
            }).catch(err => next(err));

        }).catch(err => next(err));
    }).catch(err => next(err));  

}

const getParticulierKYC = async (req, res, next) => {
    const particulier_id = req.params.particulierId;
    await KYC.Particulier.findByParticulierId(particulier_id).then(kyc => {
        if (!kyc) return response(res, 404, `KYC non trouvé !`);
        return response(res, 200, `Chargement du KYC particulier`, kyc);
    }).catch(err => next(err));
}

// ENTREPRISE

const createEntrepriseKYC = async (req, res, next) => {

    console.log(`Ajout des paramètres KYC de l'entreprise..`);

    const entreprise_id = req.params.entrepriseId;
    await Entreprise.findById(entreprise_id).then(async entreprise => {
        if (!entreprise) return response(res, 404, `Compte entreprise inexistant !`);
        console.log(`Vérification de l'existance du KYC`);
        await KYC.Entreprise.findByEntrepriseId(entreprise.r_i).then(async exists => {
            if(exists) return response(res, 409, `Paramètre KYC déjà renseigné !`);
            console.log(`Début de création du KYC`);
            await KYC.Entreprise.create(entreprise.r_i, {...req.body}).then(async kyc => {
                if (!kyc) return response(res, 400, `Une erreur s'est produite !`);
                // await Acteur.updateStatus(acteur.r_i, 2).catch(err => next(err));
                return response(res, 201, `Ajout de KYC terminé`, kyc);
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const getEntrepriseKYC = async (req, res, next) => {
    const entreprise_id = req.params.entrepriseId;
    await KYC.Entreprise.findByEntrepriseId(entreprise_id).then(kyc => {
        if (!kyc) return response(res, 404, `Aucun paramètre KYC renseigné !`);
        return response(res, 200, `Chargement du KYC entreprise`, kyc);
    }).catch(err => next(err));
}

const updateEntrepriseKYC = async (req, res, next) => {

}

module.exports = {
    createParticulierKYC,
    updateParticulierKYC,
    getParticulierKYC,
    createEntrepriseKYC,
    getEntrepriseKYC,
    updateEntrepriseKYC
}