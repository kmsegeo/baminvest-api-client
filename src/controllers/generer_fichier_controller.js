const response = require('../middlewares/response');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const Acteur = require('../models/Acteur');
const KYC = require('../models/KYC');
const Client = require('../models/Client');
const Document = require('../models/Document');
const TypeDocument = require('../models/TypeDocument');
const ProfilRisqueReponse = require('../models/ProfilRisqueReponse');
const uuid = require('uuid');

const generateKycPdfFile = async (req, res, next) => {

    console.log("Génération du fichier PDF KYC...");
    const acteurId = req.session.e_acteur;

    try {
        var acteur = await Acteur.findById(acteurId);
        if (!acteur) return response(res, 404, "Acteur non trouvé.");

        var kyc = await KYC.Particulier.findByParticulierId(acteur.e_particulier);
        if (!kyc) return response(res, 404, "KYC non trouvé pour cet acteur.");

        // Charger le PDF source
        const pdfPath = path.join(__dirname, '../files', 'KYC.pdf');
        if (!fs.existsSync(pdfPath)) return response(res, 404, "Le fichier PDF source 'KYC.pdf' est introuvable.");
        
        const existingPdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        const fontSize = 10;
        
        const fillcolor = rgb(1, 0.55, 0); // Orange
        const today = new Date();

        // ✍️ Écriture à des positions arbitraires (à ajuster selon le PDF)

        /* [PAGE 1] */
        const firstPage = pages[0];

        /* INFORMATION GENERALES */
        firstPage.drawText(today.toLocaleDateString(), { x: 154, y: 672, size: fontSize, font, color: fillcolor });
        firstPage.drawText(today.toLocaleDateString(), { x: 390, y: 672, size: fontSize, font, color: fillcolor });
        if (kyc.r_contexte_ouverture_compte==1) firstPage.drawText("X", { x: 280, y: 633, size: fontSize, font, color: fillcolor });
        if (kyc.r_contexte_ouverture_compte==2) firstPage.drawText("X", { x: 418, y: 633, size: fontSize, font, color: fillcolor });
        if (kyc.r_contexte_ouverture_compte==3) firstPage.drawText("X", { x: 523, y: 633, size: fontSize, font, color: fillcolor });
        if (kyc.r_contexte_ouverture_compte==4) { firstPage.drawText("X", { x: 106, y: 615, size: fontSize, font, color: fillcolor });
            firstPage.drawText(kyc.r_autres_contexte_ouv || "", { x: 128, y: 616, size: fontSize, font, color: fillcolor });
        }
        firstPage.drawText(kyc.r_raisons_ouverture_compte || "", {x: 244, y: 598, size: fontSize, color: fillcolor });

        if (kyc.r_ouverture_compte==1) firstPage.drawText("X", { x: 189, y: 579, size: fontSize, font, color: fillcolor });
        if (kyc.r_ouverture_compte==2) firstPage.drawText("X", { x: 264, y: 579, size: fontSize, font, color: fillcolor });

        if (kyc.r_lien_parente_sgo==1) firstPage.drawText("X", { x: 388, y: 561, size: fontSize, font, color: fillcolor });
        else firstPage.drawText("X", { x: 430, y: 561, size: fontSize, font, color: fillcolor });

        /* INFORMATION DU CLIENTS */

        if (kyc.r_civilite==1) firstPage.drawText("X", { x: 124, y: 511, size: fontSize, font, color: fillcolor });
        if (kyc.r_civilite==2) firstPage.drawText("X", { x: 184, y: 511, size: fontSize, font, color: fillcolor });

        // firstPage.drawText(kyc.nom || " ", { x: 374, y: 494, size: fontSize, font, color: fillcolor });
        firstPage.drawText(kyc.r_nom_prenom_titulaire || "", { x: 42, y: 476, size: fontSize, font, color: fillcolor });
        firstPage.drawText(kyc.r_date_naissance.toLocaleDateString() || "", { x: 132, y: 458, size: fontSize, font, color: fillcolor });

        firstPage.drawText(kyc.r_pays_naissance || "", { x: 132, y: 440, size: fontSize, font, color: fillcolor });
        firstPage.drawText(kyc.r_pays_residence || "", { x: 386, y: 440, size: fontSize, font, color: fillcolor });

        if (kyc.r_situation_matrimoniale==1) firstPage.drawText("X", { x: 198, y: 421, size: fontSize, font, color: fillcolor });
        if (kyc.r_situation_matrimoniale==2) firstPage.drawText("X", { x: 245, y: 421, size: fontSize, font, color: fillcolor });
        if (kyc.r_situation_matrimoniale==3) firstPage.drawText("X", { x: 331, y: 421, size: fontSize, font, color: fillcolor });
        if (kyc.r_situation_matrimoniale==4) firstPage.drawText("X", { x: 376, y: 421, size: fontSize, font, color: fillcolor });

        firstPage.drawText(kyc.r_telephone || "", { x: 104, y: 404, size: fontSize, font, color: fillcolor });
        firstPage.drawText(kyc.r_email || "", { x: 338, y: 404, size: fontSize, font, color: fillcolor });

        if (kyc.r_situation_habitat==1) firstPage.drawText("X", { x: 175, y: 385, size: fontSize, font, color: fillcolor });
        if (kyc.r_situation_habitat==2) firstPage.drawText("X", { x: 264, y: 385, size: fontSize, font, color: fillcolor });
        if (kyc.r_situation_habitat==3) firstPage.drawText("X", { x: 335, y: 385, size: fontSize, font, color: fillcolor });

        if (kyc.r_categorie_professionnelle==1) firstPage.drawText("X", { x: 252, y: 366, size: fontSize, font, color: fillcolor });
        if (kyc.r_categorie_professionnelle==2) firstPage.drawText("X", { x: 332, y: 366, size: fontSize, font, color: fillcolor });
        if (kyc.r_categorie_professionnelle==3) firstPage.drawText("X", { x: 466, y: 366, size: fontSize, font, color: fillcolor });
        if (kyc.r_categorie_professionnelle==4) firstPage.drawText("X", { x: 522, y: 366, size: fontSize, font, color: fillcolor });
        if (kyc.r_categorie_professionnelle==5) firstPage.drawText("X", { x: 120, y: 348, size: fontSize, font, color: fillcolor });
        if (kyc.r_categorie_professionnelle==6) firstPage.drawText("X", { x: 200, y: 348, size: fontSize, font, color: fillcolor });
        if (kyc.r_categorie_professionnelle==7)  { firstPage.drawText("X", { x: 282, y: 348, size: fontSize, font, color: fillcolor });
            firstPage.drawText(kyc.autres_categorie_prof | " ", { x: 306, y: 350, size: fontSize, font, color: fillcolor });
        }

        firstPage.drawText(kyc.r_profession || "", { x: 100, y: 332, size: fontSize, font, color: fillcolor });
        firstPage.drawText(kyc.r_employeur || "", { x: 406, y: 332, size: fontSize, font, color: fillcolor });

        firstPage.drawText(kyc.r_nbr_enfants.toString() || "", { x: 226, y: 314, size: fontSize, font, color: fillcolor });
        if (kyc.r_langue_preferee==1) firstPage.drawText("X", { x: 412, y: 312, size: fontSize, font, color: fillcolor });
        if (kyc.r_langue_preferee==2) firstPage.drawText("X", { x: 466, y: 312, size: fontSize, font, color: fillcolor });

        firstPage.drawText(kyc.r_instrument_paiement_privilige || "", { x: 206, y: 296, size: fontSize, font, color: fillcolor });

        /* INFORMATION FINANCIER */

        if (kyc.r_origine_ressources_investies==1) firstPage.drawText("X", { x: 218, y: 246, size: fontSize, font, color: fillcolor });
        if (kyc.r_origine_ressources_investies==2) firstPage.drawText("X", { x: 273, y: 246, size: fontSize, font, color: fillcolor });
        if (kyc.r_origine_ressources_investies==3) firstPage.drawText("X", { x: 334, y: 246, size: fontSize, font, color: fillcolor });
        if (kyc.r_origine_ressources_investies==4) { firstPage.drawText("X", { x: 416, y: 246, size: fontSize, font, color: fillcolor });
            firstPage.drawText(kyc.r_autres_origines_ressources || "", { x: 440, y: 246, size: fontSize, font, color: fillcolor }); 
        }

        if (kyc.r_tranche_revenus==1) firstPage.drawText("X", { x: 288, y: 226, size: fontSize, font, color: fillcolor });
        if (kyc.r_tranche_revenus==2) firstPage.drawText("X", { x: 396, y: 227, size: fontSize, font, color: fillcolor });
        if (kyc.r_tranche_revenus==3) firstPage.drawText("X", { x: 465, y: 227, size: fontSize, font, color: fillcolor });

        if (kyc.r_autres_actifs==1) firstPage.drawText("X", { x: 180, y: 209, size: fontSize, font, color: fillcolor });
        if (kyc.r_autres_actifs==2) firstPage.drawText("X", { x: 292, y: 208, size: fontSize, font, color: fillcolor });
        if (kyc.r_autres_actifs==3) firstPage.drawText("X", { x: 392, y: 208, size: fontSize, font, color: fillcolor });
        if (kyc.r_autres_actifs==4) firstPage.drawText("X", { x: 465, y: 209, size: fontSize, font, color: fillcolor });
        if (kyc.r_autres_actifs==5) { firstPage.drawText("X", { x: 108, y: 191, size: fontSize, font, color: fillcolor });
            firstPage.drawText(kyc.r_autres_actifs_preciser || "", { x: 134, y: 193, size: fontSize, font, color: fillcolor });
        }

        if (kyc.autres_comptes_bridge==1) { firstPage.drawText("X", { x: 421, y: 174, size: fontSize, font, color: fillcolor }); 
            firstPage.drawText(kyc.r_comptes_bridges || "", { x: 118, y: 157, size: fontSize, font, color: fillcolor });
        } else { firstPage.drawText("X", { x: 462, y: 174, size: fontSize, font, color: fillcolor }); }

        firstPage.drawText(kyc.r_banques_relations || "", { x: 316, y: 140, size: fontSize, font, color: fillcolor });


        /* [PAGE 2] */
        const secondPage = pages[1];

        /* AUTRE INFORMATION */

        if (kyc.r_activites_politiques==1) { secondPage.drawText("X", { x: 62, y: 725, size: fontSize, font, color: fillcolor }); 
            secondPage.drawText(kyc.r_preciser_activite_politiq || "", { x: 284, y: 726, size: fontSize, font, color: fillcolor }); 
        } else { secondPage.drawText("X", { x: 104, y: 725, size: fontSize, font, color: fillcolor }); }

        if (kyc.r_proche_politicien==1) { secondPage.drawText("X", { x: 180, y: 689, size: fontSize, font, color: fillcolor });
            secondPage.drawText(kyc.r_preciser_proche_politicien || "", { x: 44, y: 672, size: fontSize, font, color: fillcolor });
        } else {secondPage.drawText("X", { x: 224, y: 689, size: fontSize, font, color: fillcolor });}
            
        /* PERSONNES A CONTACTER EN CAS D’INDISPONIBILITE */

        // secondPage.drawText("KOUAME Koffi jaures Patrick", { x: 124, y: 552, size: fontSize, font, color: fillcolor });
        // secondPage.drawText("225 2700000000", { x: 124, y: 534, size: fontSize, font, color: fillcolor });
        // secondPage.drawText("225 0700000000", { x: 124, y: 516, size: fontSize, font, color: fillcolor });
        // secondPage.drawText("kmjaures@gmail.com", { x: 124, y: 498, size: fontSize, font, color: fillcolor });

        secondPage.drawText(today.toLocaleDateString(), { x: 324, y: 180, size: fontSize, font, color: fillcolor });
        secondPage.drawText("Abidjan", { x: 464, y: 180, size: fontSize, font, color: fillcolor });

        /* FIN */

        // 💾 Sauvegarde locale du fichier

        const pdfBytes = await pdfDoc.save();
        const fileName = `kyc_${kyc.r_reference}_${Date.now()}.pdf`;
        const outputPath = path.join(__dirname, '../../temp', fileName);
        fs.writeFileSync(outputPath, pdfBytes);

        // Sauvegarde du chemin dans la db

        const chemin_fichier = `${req.protocol}://${req.get('host')}/api/bamclient/temp/${fileName}`;

        // const typedoc_intitule = "kyc";
        // var type = await TypeDocument.findByIntitule(typedoc_intitule);
        // if (!type) return response(res, 404, `Type de document '${typedoc_intitule}' non trouvé.`);
        // var doc = await Document.create({
        //     acteur_id: acteurId, 
        //     type_document: type.r_i, 
        //     nom_fichier: fileName, 
        //     chemin_fichier: chemin_fichier
        // });

        return response(res, 200, "Fichier KYC généré avec succès.", chemin_fichier);

        // 📤 Aperçu direct dans le navigateur

        // console.log(`Fichier KYC généré avec succès: ${fileName}`);

        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
        // res.send(pdfBytes);

    } catch (error) {
        console.error('Erreur:', error);
        next(error);
    }

}

const generateProfilrisquePdfFile = async (req, res, next) => {

    try {

        const pdfPath = path.join(__dirname, '../files', 'PROFILRISQUE.pdf');
        if (!fs.existsSync(pdfPath)) return response(res, 404, "Le fichier PDF source 'PROFILRISQUE.pdf' est introuvable.");
        
        const existingPdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const fontSize = 10;
        const fillcolor = rgb(1, 0.55, 0); // Orange

        const today = new Date();
        
        const acteurId = req.session.e_acteur;
        
        const acteur = await Acteur.findById(acteurId);
        if (!acteur) return response(res, 404, "Acteur non trouvé.");

        const particulier = await Client.Particulier.findById(acteur.e_particulier);
        if (!particulier) return response(res, 404, "Particulier non trouvé pour cet acteur.");

        const ra = await ProfilRisqueReponse.findAllByActeur(acteurId);

        // ✍️ Écriture à des positions arbitraires (à ajuster selon le PDF)

        /* [PAGE 1] */
        const firstPage = pages[0];

        /* INFORMATION GENERALES */
        firstPage.drawText(acteur.r_nom_complet, { x: 134, y: 738, size: fontSize, font, color: fillcolor });
        firstPage.drawText(particulier.r_date_naissance.toLocaleDateString() || "", { x: 134, y: 720, size: fontSize, font, color: fillcolor });
        firstPage.drawText(today.toLocaleDateString(), { x: 134, y: 702, size: fontSize, font, color: fillcolor });

        /* PARTIE 1 : OBJECTIFS D’INVESTISSEMENT */
        for (let question of ra) {

            if (question.e_risques_questions == 15) {
                
                /* Question 1 */
                if (question.e_risque_reponse == 50) firstPage.drawText("X", { x: 78, y: 501, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse == 51) firstPage.drawText("X", { x: 78, y: 487, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse == 52) firstPage.drawText("X", { x: 78, y: 473, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse == 53) firstPage.drawText("X", { x: 78, y: 459, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse == 54) firstPage.drawText("X", { x: 78, y: 446, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse == 55) firstPage.drawText("X", { x: 78, y: 433, size: fontSize, font, color: fillcolor });
            }

            if (question.e_risques_questions == 16) {
                /* PARTIE 2 : CONNAISSANCE ET EXPERIENCE EN MATIERE D’INVESTISSEMENTS */
                /* Question 2 */
                if (question.e_risque_reponse==59) {
                    if (question.e_risque_reponse==56) firstPage.drawText("X", { x: 238, y: 328, size: fontSize, font, color: fillcolor });
                    if (question.e_risque_reponse==57) firstPage.drawText("X", { x: 352, y: 328, size: fontSize, font, color: fillcolor });
                    if (question.e_risque_reponse==58) firstPage.drawText("X", { x: 462, y: 328, size: fontSize, font, color: fillcolor });
                }

                if (question.e_risque_reponse==60) {
                    if (question.e_risque_reponse==56) firstPage.drawText("X", { x: 238, y: 313, size: fontSize, font, color: fillcolor });
                    if (question.e_risque_reponse==57) firstPage.drawText("X", { x: 352, y: 313, size: fontSize, font, color: fillcolor });
                    if (question.e_risque_reponse==58) firstPage.drawText("X", { x: 462, y: 313, size: fontSize, font, color: fillcolor });
                }

                if (question.e_risque_reponse==61) {
                    if (question.e_risque_reponse==56) firstPage.drawText("X", { x: 238, y: 299, size: fontSize, font, color: fillcolor });
                    if (question.e_risque_reponse==57) firstPage.drawText("X", { x: 352, y: 299, size: fontSize, font, color: fillcolor });
                    if (question.e_risque_reponse==58) firstPage.drawText("X", { x: 462, y: 299, size: fontSize, font, color: fillcolor });
                }
            }

            if (question.e_risques_questions == 17) {
                /* Question 3 */
                if (question.e_risque_reponse==62) firstPage.drawText("X", { x: 78, y: 245, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==63) firstPage.drawText("X", { x: 78, y: 232, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==64) firstPage.drawText("X", { x: 78, y: 219, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==65) firstPage.drawText("X", { x: 78, y: 206, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==66) firstPage.drawText("X", { x: 78, y: 193, size: fontSize, font, color: fillcolor });
            }

            if (question.e_risques_questions == 18) {
                /* PARTIE 3 : CAPACITE A PRENDRE DU RISQUE*/
                /* Question 4 */
                if (question.e_risque_reponse==67) firstPage.drawText("X", { x: 78, y: 126, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==68) firstPage.drawText("X", { x: 78, y: 112, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==69) firstPage.drawText("X", { x: 78, y: 98, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==70) firstPage.drawText("X", { x: 78, y: 85, size: fontSize, font, color: fillcolor });
            }
            
        }

        /* [PAGE 2] */
        const secondPage = pages[1];

        for (let question of ra) {

            if (question.e_risques_questions == 19) {
                /* Question 5 */
                if (question.e_risque_reponse==71) secondPage.drawText("X", { x: 78, y: 744, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==72) secondPage.drawText("X", { x: 78, y: 730, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==73) secondPage.drawText("X", { x: 78, y: 716, size: fontSize, font, color: fillcolor });
            }

            if (question.e_risques_questions == 20) {
                /* Question 6 */
                if (question.e_risque_reponse==74) secondPage.drawText("X", { x: 78, y: 658, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==75) secondPage.drawText("X", { x: 78, y: 645, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==76) secondPage.drawText("X", { x: 78, y: 631, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==77) secondPage.drawText("X", { x: 78, y: 617, size: fontSize, font, color: fillcolor });
            }

            if (question.e_risques_questions == 21) {
                /* Question 7 */
                if (question.e_risque_reponse==78) secondPage.drawText("X", { x: 78, y: 531, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==79) secondPage.drawText("X", { x: 78, y: 519, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==80) secondPage.drawText("X", { x: 78, y: 507, size: fontSize, font, color: fillcolor });
            }

            if (question.e_risques_questions == 22) {
                /* Question 8 */
                if (question.e_risque_reponse==81) secondPage.drawText("X", { x: 102, y: 456, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==82) secondPage.drawText("X", { x: 142, y: 456, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==83) secondPage.drawText("X", { x: 188, y: 456, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==84) secondPage.drawText("X", { x: 232, y: 456, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==85) secondPage.drawText("X", { x: 276, y: 456, size: fontSize, font, color: fillcolor });
            }

            if (question.e_risques_questions == 23) {
                /* Question 9 */
                if (question.e_risque_reponse==86) secondPage.drawText("X", { x: 312, y: 242, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==87) secondPage.drawText("X", { x: 312, y: 230, size: fontSize, font, color: fillcolor });
                if (question.e_risque_reponse==88) secondPage.drawText("X", { x: 312, y: 217, size: fontSize, font, color: fillcolor });
            }

        }

        // /* [PAGE 3] */
        const thirdPage = pages[2];

        /* PROFIL INVESTISSEUR */
        thirdPage.drawText(acteur.r_nom_complet || "", { x: 158, y: 730, size: fontSize, font, color: fillcolor });

        // thirdPage.drawText("X", { x: 89, y: 679, size: fontSize, font, color: fillcolor });
        // thirdPage.drawText("X", { x: 297, y: 679, size: fontSize, font, color: fillcolor });
        // thirdPage.drawText("X", { x: 463, y: 679, size: fontSize, font, color: fillcolor });

        /* RESULTATS DU QUESTIONNAIRE */
        thirdPage.drawText(acteur.profil_investisseur || "", { x: 156, y: 290, size: fontSize, font, color: fillcolor });
        thirdPage.drawText("Abidjan", { x: 92, y: 206, size: fontSize, font, color: fillcolor });
        thirdPage.drawText(today.toLocaleDateString(), { x: 206, y: 206, size: fontSize, font, color: fillcolor });
        
        /* FIN */

        // 💾 Sauvegarde locale

        const pdfBytes = await pdfDoc.save();

        const fileName = `prsq_${uuid.v4()}_${Date.now()}.pdf`;
        const outputPath = path.join(__dirname, '../../temp', fileName);
        fs.writeFileSync(outputPath, pdfBytes);

        // Sauvegarde du chemin dans la db

        const chemin_fichier = `${req.protocol}://${req.get('host')}/api/bamclient/temp/${fileName}`;

        // const typedoc_intitule = "profilrisque";
        // var type = await TypeDocument.findByIntitule(typedoc_intitule);
        // if (!type) return response(res, 404, `Type de document '${typedoc_intitule}' non trouvé.`);
        // var doc = await Document.create({
        //     acteur_id: acteurId, 
        //     type_document: type.r_i, 
        //     nom_fichier: fileName, 
        //     chemin_fichier: chemin_fichier
        // });

        return response(res, 200, "Fichier profilrisque généré avec succès.", chemin_fichier);

        // 📤 Aperçu direct dans le navigateur

        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'inline; filename=filled_profilrisque_preview.pdf');
        // res.send(pdfBytes);

    } catch (error) {
        console.error('Erreur:', error);
        next(error);
    }

}

const generateConventionPdfFile = async (req, res, next) => {

    try {

        const pdfPath = path.join(__dirname, '../files', 'CONVENTION.pdf');
        if (!fs.existsSync(pdfPath)) return response(res, 404, "Le fichier PDF source 'CONVENTION.pdf' est introuvable.");
        
        const existingPdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const fontSize = 10;
        const fillcolor = rgb(1, 0.55, 0);      // Orange
        

        // ✍️ Écriture à des positions arbitraires (à ajuster selon le PDF)

        const today = new Date();
        const acteurId = req.session.e_acteur;
        
        const acteur = await Acteur.findById(acteurId);
        if (!acteur) return response(res, 404, "Acteur non trouvé.");
        console.log("acteur", acteur);

        const particulier = await Client.Particulier.findById(acteur.e_particulier);
        if (!particulier) return response(res, 404, "Particulier non trouvé pour cet acteur.");
        console.log("particulier", particulier);

        /* [PAGE 3] */
        const thirdPage = pages[2];

        if (particulier.r_civilite==1) thirdPage.drawText("X", { x: 78, y: 528, size: fontSize, font, color: fillcolor });
        if (particulier.r_civilite==2) thirdPage.drawText("X", { x: 131, y: 528, size: fontSize, font, color: fillcolor });
        if (particulier.r_civilite==3) thirdPage.drawText("X", { x: 188, y: 528, size: fontSize, font, color: fillcolor });

        thirdPage.drawText(particulier.r_nom || "", { x: 218, y: 498, size: fontSize, font, color: fillcolor });
        thirdPage.drawText(particulier.r_nom_jeune_fille || "", { x: 218, y: 471, size: fontSize, font, color: fillcolor });
        thirdPage.drawText(particulier.r_prenom || "", { x: 218, y: 444, size: fontSize, font, color: fillcolor });
        thirdPage.drawText(particulier.r_date_naissance.toLocaleDateString() || "", { x: 132, y: 417, size: fontSize, font, color: fillcolor });
        thirdPage.drawText("Abidjan", { x: 288, y: 417, size: fontSize, font, color: fillcolor });
        thirdPage.drawText(particulier.r_nationalite || "", { x: 142, y: 389, size: fontSize, font, color: fillcolor });
        thirdPage.drawText(particulier.r_num_piece || "", { x: 242, y: 361, size: fontSize, font, color: fillcolor });
        thirdPage.drawText(acteur.r_adresse || "", { x: 132, y: 334, size: fontSize, font, color: fillcolor });
        thirdPage.drawText(acteur.r_telephone_prp || "", { x: 140, y: 306, size: fontSize, font, color: fillcolor });
        thirdPage.drawText(acteur.r_email || "", { x: 338, y: 306, size: fontSize, font, color: fillcolor });

        if (particulier.r_type_compte==1) thirdPage.drawText("X", { x: 79, y: 270, size: fontSize, font, color: fillcolor });
        if (particulier.r_type_compte==2) thirdPage.drawText("X", { x: 265, y: 270, size: fontSize, font, color: fillcolor });
        if (particulier.r_type_compte==3) {
            thirdPage.drawText("X", { x: 426, y: 270, size: fontSize, font, color: fillcolor });
            thirdPage.drawText("", { x: 208, y: 252, size: fontSize, font, color: fillcolor });
            thirdPage.drawText("", { x: 208, y: 232, size: fontSize, font, color: fillcolor });
        }

        /* [PAGE 11] */
        const eleventhPage = pages[10];
        eleventhPage.drawText(today.toLocaleDateString(), { x: 128, y: 562, size: fontSize, font, color: fillcolor });

        if (particulier.r_type_compte==3) {
            /* [PAGE 12] */
            const twelfthPage = pages[11];
            /* ANNEXE I : FICHE D’IDENTIFICATION DU COTITULAIRE DU COMPTE */
            twelfthPage.drawText("X", { x: 78, y: 665, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("X", { x: 131, y: 665, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("X", { x: 188, y: 665, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("1", { x: 172, y: 641, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("2", { x: 172, y: 615, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("3", { x: 172, y: 587, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("4", { x: 128, y: 560, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("5", { x: 288, y: 560, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("6", { x: 138, y: 532, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("7", { x: 242, y: 505, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("8", { x: 132, y: 477, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("9", { x: 140, y: 449, size: fontSize, font, color: fillcolor });
            twelfthPage.drawText("10", { x: 338, y: 449, size: fontSize, font, color: fillcolor });
        }

        /* [PAGE 14] */
        if (acteur.e_signataire!=0) {
            const fourteenthPage = pages[13];
            /* ANNEXE III : FICHE DE PROCURATION */
            fourteenthPage.drawText("1", { x: 168, y: 705, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("2", { x: 202, y: 683, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("3", { x: 140, y: 661, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("4", { x: 140, y: 640, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("5", { x: 274, y: 618, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("6", { x: 148, y: 597, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("7", { x: 162, y: 575, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("8", { x: 130, y: 554, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("9", { x: 138, y: 532, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("10", { x: 156, y: 511, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("10", { x: 216, y: 463, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("X", { x: 81, y: 406, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("X", { x: 328, y: 406, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("11", { x: 448, y: 409, size: fontSize, font, color: fillcolor });
            fourteenthPage.drawText("12", { x: 166, y: 368, size: fontSize, font, color: fillcolor });
        }

        /* [PAGE 15] */
        if (acteur.e_represantant!=0) {
            const fifteenthPage = pages[14];
            /* ANNEXE IV : FICHE D’IDENTIFICATION DU REPRESENTANT LEGAL */
            fifteenthPage.drawText("X", { x: 78, y: 712, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("X", { x: 131, y: 712, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("X", { x: 188, y: 712, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("1", { x: 172, y: 689, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("2", { x: 172, y: 663, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("3", { x: 172, y: 635, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("4", { x: 128, y: 607, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("5", { x: 288, y: 607, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("6", { x: 138, y: 580, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("7", { x: 242, y: 552, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("8", { x: 140, y: 525, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("9", { x: 134, y: 497, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("10", { x: 140, y: 470, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("11", { x: 338, y: 470, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("12", { x: 268, y: 429, size: fontSize, font, color: fillcolor });
            fifteenthPage.drawText("13", { x: 268, y: 401, size: fontSize, font, color: fillcolor });
        }

        /* FIN */

        // 💾 Sauvegarde locale

        const pdfBytes = await pdfDoc.save();
        const fileName = `conv_${uuid.v4()}_${Date.now()}.pdf`;
        const outputPath = path.join(__dirname, '../../temp', fileName);
        fs.writeFileSync(outputPath, pdfBytes);

        // Sauvegarde du chemin dans la db

        const chemin_fichier = `${req.protocol}://${req.get('host')}/api/bamclient/temp/${fileName}`;

        // const typedoc_intitule = "convention";
        // var type = await TypeDocument.findByIntitule(typedoc_intitule);
        // if (!type) return response(res, 404, `Type de document '${typedoc_intitule}' non trouvé.`);
        // var doc = await Document.create({
        //     acteur_id: acteurId, 
        //     type_document: type.r_i, 
        //     nom_fichier: fileName, 
        //     chemin_fichier: chemin_fichier
        // });

        return response(res, 200, "Fichier profilrisque généré avec succès.", chemin_fichier);

        // 📤 Aperçu direct dans le navigateur

        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'inline; filename=filled_convention_preview.pdf');
        // res.send(pdfBytes);

    } catch (error) {
        console.error('Erreur:', error);
        next(error);
    }

}


module.exports = {
    generateKycPdfFile,
    generateProfilrisquePdfFile,
    generateConventionPdfFile
}