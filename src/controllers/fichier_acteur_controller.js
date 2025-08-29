const response = require('../middlewares/response');
const Document = require('../models/Document');

const getActeurFiles = async (req, res, next) => {
    const acteurId = req.session.e_acteur;
    try {
        const data = await Document.findAllByActeurId(acteurId);
        return response(res, 200, 'Chargement des fichiers de l\'acteur terminé', data);
    } catch (error) {
        next(error);
    }
};

const getFileByRef = async (req, res, next) => {
    const ref = req.params.ref;
    try {
        const data = await Document.findByRef(ref);
        if (!data) return response(res, 404, 'Aucun fichier trouvé avec cette référence');
        return response(res, 200, 'Chargement du fichier terminé', data);
    } catch (error) {
        next(error);
    }
}; 

const getPhotoProfilFile = async (req, res, next) => {
    const acteurId = req.session.e_acteur;
    try {
        const data = await Document.findBySpecific(acteurId, 'photoprofil');
        if (!data) return response(res, 404, 'Aucun fichier de photo de profil trouvé pour cet acteur');
        return response(res, 200, 'Chargement de la photo de profil terminé', data);
    } catch (error) {
        next(error);
    }
};

const getDomiciliationFile = async (req, res, next) => {
    const acteurId = req.session.e_acteur;
    try {
        const data = await Document.findBySpecific(acteurId, 'domiciliation');
        return response(res, 200, 'Chargement du fichier de domiciliation terminé', data);
    } catch (error) {
        next(error);
    }
};

const getSignatureFile = async (req, res, next) => {
    const acteurId = req.session.e_acteur;
    try {
        const data = await Document.findBySpecific(acteurId, 'signature');
        return response(res, 200, 'Chargement du fichier de signature terminé', data);
    } catch (error) {
        next(error);
    }
};

const getKycFile = async (req, res, next) => {
    const acteurId = req.session.e_acteur;
    try {
        const data = await Document.findBySpecific(acteurId, 'kyc');
        if (!data) return response(res, 404, 'Aucun fichier KYC trouvé pour cet acteur');
        return response(res, 200, 'Chargement du fichier KYC terminé', data);
    } catch (error) {
        next(error);
    }
};

const getProfilRisqueFile = async (req, res, next) => {
    const acteurId = req.session.e_acteur;
    try {
        const data = await Document.findBySpecific(acteurId, 'profilrisque');
        if (!data) return response(res, 404, 'Aucun fichier de profil de risque trouvé pour cet acteur');
        return response(res, 200, 'Chargement du fichier de profil de risque terminé', data);
    } catch (error) {
        next(error);
    }
};

const getConventionFiles = async (req, res, next) => {
    const acteurId = req.session.e_acteur;
    try {
        const data = await Document.findBySpecific(acteurId, 'convention');
        if (!data) return response(res, 404, 'Aucun fichier de convention trouvé pour cet acteur');
        return response(res, 200, 'Chargement des fichiers de convention terminé', data);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getActeurFiles,
    getFileByRef,
    getPhotoProfilFile,
    getDomiciliationFile,
    getSignatureFile,
    getKycFile,
    getProfilRisqueFile,
    getConventionFiles
};

