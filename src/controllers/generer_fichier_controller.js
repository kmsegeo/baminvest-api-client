const response = require('../middlewares/response');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// app.post('/fill-pdf', async (req, res) => {

const generateKycPdfFile = async (req, res, next) => {

  try {

    const pdfPath = path.join(__dirname, '../files', 'KYC_PP.pdf');
    if (!fs.existsSync(pdfPath)) return response(res, 404, "Le fichier PDF source 'KYC_PP.pdf' est introuvable.");
    
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSize = 10;
    const fillcolor = rgb(0, 0, 0);

    const today = new Date();

    // ✍️ Écriture à des positions arbitraires (à ajuster selon le PDF)

    /* [PAGE 1] */
    //const firstPage = pages[0];

    const firstPage = pages[0]

    /* INFORMATION GENERALES */
    firstPage.drawText(today.toLocaleDateString(), { x: 154, y: 672, size: fontSize, font, color: fillcolor });
    firstPage.drawText(today.toLocaleDateString(), { x: 390, y: 672, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 280, y: 633, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 418, y: 633, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 523, y: 633, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 106, y: 615, size: fontSize, font, color: fillcolor });
    firstPage.drawText("Publicité sur internet", { x: 128, y: 616, size: fontSize, font, color: fillcolor });
    firstPage.drawText("Precision de la raison de l'ouverture de compte", {x: 244, y: 598, size: fontSize, color: fillcolor });
    firstPage.drawText("X", { x: 189, y: 579, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 264, y: 579, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 388, y: 561, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 430, y: 561, size: fontSize, font, color: fillcolor });

    /* INFORMATION DU CLIENTS */

    firstPage.drawText("X", { x: 124, y: 511, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 184, y: 511, size: fontSize, font, color: fillcolor });

    firstPage.drawText("KOUAME", { x: 374, y: 494, size: fontSize, font, color: fillcolor });
    firstPage.drawText("Kouadio Serge Olivier", { x: 42, y: 476, size: fontSize, font, color: fillcolor });
    firstPage.drawText("31/03/1987", { x: 132, y: 458, size: fontSize, font, color: fillcolor });

    firstPage.drawText("Côte d'Ivoire", { x: 132, y: 440, size: fontSize, font, color: fillcolor });
    firstPage.drawText("Côte d'Ivoire", { x: 386, y: 440, size: fontSize, font, color: fillcolor });

    firstPage.drawText("X", { x: 198, y: 421, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 245, y: 421, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 331, y: 421, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 376, y: 421, size: fontSize, font, color: fillcolor });

    firstPage.drawText("225 0709672948", { x: 104, y: 404, size: fontSize, font, color: fillcolor });
    firstPage.drawText("kmsergeo@gmail.com", { x: 338, y: 404, size: fontSize, font, color: fillcolor });

    firstPage.drawText("X", { x: 175, y: 385, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 264, y: 385, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 335, y: 385, size: fontSize, font, color: fillcolor });

    firstPage.drawText("X", { x: 252, y: 366, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 332, y: 366, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 466, y: 366, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 522, y: 366, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 120, y: 348, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 200, y: 348, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 282, y: 348, size: fontSize, font, color: fillcolor });
    firstPage.drawText("Catégorie Professionnelle", { x: 306, y: 350, size: fontSize, font, color: fillcolor });

    firstPage.drawText("Developpeur", { x: 100, y: 332, size: fontSize, font, color: fillcolor });
    firstPage.drawText("Médiasoft", { x: 406, y: 332, size: fontSize, font, color: fillcolor });

    firstPage.drawText("03", { x: 226, y: 314, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 412, y: 312, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 466, y: 312, size: fontSize, font, color: fillcolor });

    firstPage.drawText("Mobile monney", { x: 206, y: 296, size: fontSize, font, color: fillcolor });

    /* INFORMATION FINANCIER */

    firstPage.drawText("X", { x: 218, y: 246, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 273, y: 246, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 334, y: 246, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 416, y: 246, size: fontSize, font, color: fillcolor });
    firstPage.drawText("Origine des ressources", { x: 440, y: 246, size: fontSize, font, color: fillcolor });

    firstPage.drawText("X", { x: 288, y: 227, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 396, y: 227, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 465, y: 227, size: fontSize, font, color: fillcolor });

    firstPage.drawText("X", { x: 180, y: 209, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 292, y: 208, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 392, y: 208, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 465, y: 209, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 108, y: 191, size: fontSize, font, color: fillcolor });
    firstPage.drawText("Autre actifs", { x: 134, y: 193, size: fontSize, font, color: fillcolor });

    firstPage.drawText("X", { x: 421, y: 174, size: fontSize, font, color: fillcolor });
    firstPage.drawText("X", { x: 462, y: 174, size: fontSize, font, color: fillcolor });
    firstPage.drawText("La filiale", { x: 118, y: 157, size: fontSize, font, color: fillcolor });
    firstPage.drawText("Nom de banque", { x: 316, y: 140, size: fontSize, font, color: fillcolor });


    /* [PAGE 2] */
    const secondPage = pages[1];

    /* AUTRE INFORMATION */

    secondPage.drawText("X", { x: 62, y: 725, size: fontSize, font, color: fillcolor });
    secondPage.drawText("X", { x: 104, y: 725, size: fontSize, font, color: fillcolor });
    secondPage.drawText("Fonction politique", { x: 284, y: 726, size: fontSize, font, color: fillcolor });

    secondPage.drawText("X", { x: 180, y: 689, size: fontSize, font, color: fillcolor });
    secondPage.drawText("X", { x: 224, y: 689, size: fontSize, font, color: fillcolor });
    secondPage.drawText("Fonction politique - Côte d'Ivoire", { x: 44, y: 672, size: fontSize, font, color: fillcolor });

    /* PERSONNES A CONTACTER EN CAS D’INDISPONIBILITE */

    secondPage.drawText("KOUAME Koffi jaures Patrick", { x: 124, y: 552, size: fontSize, font, color: fillcolor });
    secondPage.drawText("225 2700000000", { x: 124, y: 534, size: fontSize, font, color: fillcolor });
    secondPage.drawText("225 0700000000", { x: 124, y: 516, size: fontSize, font, color: fillcolor });
    secondPage.drawText("kmjaures@gmail.com", { x: 124, y: 498, size: fontSize, font, color: fillcolor });

    secondPage.drawText(today.toLocaleDateString(), { x: 324, y: 180, size: fontSize, font, color: fillcolor });
    secondPage.drawText("Abidjan", { x: 464, y: 180, size: fontSize, font, color: fillcolor });

    /* FIN */


    // 💾 Sauvegarde locale

    const finalBytes = await pdfDoc.save();
    const fileName = `KYC_PP_filtered_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '../../uploads', fileName);
    fs.writeFileSync(outputPath, finalBytes);

    // 📤 Aperçu direct dans le navigateur

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=filled_kyc_preview.pdf');
    res.send(finalBytes);

  } catch (error) {
    console.error('Erreur:', error);
    next(error);
  }

}

module.exports = {
    generateKycPdfFile,
}