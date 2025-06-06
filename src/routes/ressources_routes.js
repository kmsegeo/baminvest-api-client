const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const clientRsrcController = require('../controllers/client_ressouces_controller');
const operationController = require('../controllers/operation_controller')
const moyenPaiementController = require('../controllers/moyen_paiement_controller');
const campagneController = require('../controllers/campagne_controller');
const atsgo_auth = require('../middlewares/atsgo_auth');

router.get('/type-acteurs', app_auth, clientRsrcController.getAllTypeActeurs);

// router.get('/civilite', app_auth, clientRsrcController.getCivilite);
router.get('/type-compte', app_auth, clientRsrcController.getTypeCompte);
router.get('/contexte-ouverture-compte', app_auth, clientRsrcController.getContexteOuvertureCompte);
router.get('/ouverture-compte', app_auth, clientRsrcController.getOuvertureCompte);
router.get('/situation-matrimoniale', app_auth, clientRsrcController.getSituationMatrimoniale);
router.get('/situation-habitat', app_auth, clientRsrcController.getSituationHabitat);
router.get('/categorie-professionnelle', app_auth, clientRsrcController.getCategorieProfessionnelle);
router.get('/langues', app_auth, clientRsrcController.getLanguePreferee);
router.get('/origine-ressources-investies', app_auth, atsgo_auth, clientRsrcController.getOrigineRevenu);
router.get('/tranche-revenus', app_auth, clientRsrcController.getTrancheRevenus);
router.get('/autres-actifs', app_auth, clientRsrcController.getAutresActifs);

router.get('/categorie-compte', app_auth, atsgo_auth, clientRsrcController.getCategorieCompte);
router.get('/categorie-client', app_auth, atsgo_auth, clientRsrcController.getCategorieClient);
router.get('/categorie-fatca', app_auth, atsgo_auth, clientRsrcController.getCategorieFatca);
router.get('/type-client', app_auth, atsgo_auth, clientRsrcController.getTypeClient);
router.get('/type-compte-investissement', app_auth, atsgo_auth, clientRsrcController.getTypeCompteInvest);
router.get('/type-piece', app_auth, atsgo_auth, clientRsrcController.getTypePiece);
router.get('/pays', app_auth, atsgo_auth, clientRsrcController.getPays);
router.get('/origine-revenu', app_auth, atsgo_auth, clientRsrcController.getOrigineRevenu);
router.get('/secteur-activite', app_auth, atsgo_auth, clientRsrcController.getSecteurActivite);

router.get('/campagne/profilrisque/questions', app_auth, campagneController.getProfilRisqueQuestions);

router.get('/type-operations', app_auth, session_verify, operationController.getAllTypeOperations);
router.get('/type-moy-paiements', app_auth, session_verify, moyenPaiementController.getAllTypeMoypaiement);

module.exports = router;