const { validate } = require("uuid");
const response = require("../middlewares/response");
const { Particulier } = require("../models/Client");
const Acteur = require("../models/Acteur");

const Atsgo = {

    async onbording(apikey, client) {

        console.log('Envoi des données à ATSGO..')
        console.log(client)

        const headers =  {
            "Content-Type": "application/json",
        }
        
        await fetch(process.env.ATSGO_URL + process.env.URI_CLIENT + '?ApiKey=' + apikey, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(client),
        })
        .then(async resp => resp.json())
        .then(async data => {
            if (data.status!=200) {
                console.log(data.errors);
                throw "Erreur d'enregistrement à atsgo !";
            }
            console.log('Envoi des données terminé');

            // validation du onbording
            await validateAtsgoAccount(apikey, data.payLoad);

        }).catch(error => { throw error });
    },

    async saveMouvement (apikey, mvdata, callback) {

        console.log(`Enregistrement du mouvement..`)
        const idClient = mvdata.idClient;

        const headers =  {
            "Content-Type": "application/json",
        }

        await fetch(process.env.ATSGO_URL + process.env.URI_CLIENT_MOUVEMENT + '?ApiKey=' + apikey, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(mvdata),
        })
        .then(async resp => resp.json())
        .then(async data => {
            
            if (data.status!=200) {
                console.log(data.errors);
                throw `Erreur d'enregistrement du mouvement à atsgo !`;
            }
            
            console.log(`Enregistrement du mouvement terminé`)
            callback(data.payLoad);

            // const idOperationClient = data.payLoad;

            // Activation de l'operation
            // await validationAtsgoOperation(apikey, idClient, idOperationClient);
        })

    },

    async getOperationFees(apikey, opdata, callback) {
        
        console.log(`Envoi des données à ATSGO..`)

        const headers =  {
            "Content-Type": "application/json",
        }

        await fetch(process.env.ATSGO_URL + process.env.URI_OPERATION_FRAIS + '?ApiKey=' + apikey, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(opdata),
        })
        .then(async resp => resp.json())
        .then(async data => {
            
            if (data.status!=200) {
                console.log(data.errors);
                throw `Erreur de chargement des frais à atsgo !`;
            }

            console.log(`Chargement des frais terminé`)
            callback(data.payLoad);
            
        })
    },

    async saveOperation(apikey, opdata, callback) {
        
        console.log(`Enregistrement de l'operation..`)

        // const idClient = opdata.idClient;

        const headers =  {
            "Content-Type": "application/json",
        }

        await fetch(process.env.ATSGO_URL + process.env.URI_CLIENT_OPERATION + '?ApiKey=' + apikey, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(opdata),
        })
        .then(async resp => resp.json())
        .then(async data => {
            
            if (data.status!=200) {
                console.log(data.errors);
                throw `Erreur d'enregistrement de l'operation à atsgo !`;
            }

            console.log(`Enregistrement de l'operation terminé`)
            callback(data.payLoad);
            // const idOperationClient = data.payLoad;

            // Activation de l'operation
            // await validationAtsgoOperation(apikey, idClient, idOperationClient);
        })
        
    },

    async findClientOperation(apikey, idClient, callback) {
        
        await fetch(process.env.ATSGO_URL + process.env.URI_CLIENT_OPERATIONS + '?ApiKey=' + apikey + '&idClient=' + idClient)
        .then(async resp => resp.json())
        .then(async data => {
            console.log(`Chargement operations terminé`)
            callback(data.payLoad);
        })
    }
}

async function validateAtsgoAccount(apikey, data) {

    console.log(`Validation du compte atsgo..`)

    const headers =  {
        "Content-Type": "application/json",
    }

    const idClient = data.idClient;
    const ref = data.email;

    await fetch(process.env.ATSGO_URL + process.env.URI_CLIENT_VALIDATE + '?ApiKey=' + apikey, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({idClient}),
    })
    .then(resp => resp.json())
    .then(async validate => {
        if (validate.status!=200) {
            console.log(validate.errors);
            throw "Erreur lors de la validation du compte atsgo !";
        }
        console.log(`Validation du compte terminé`);
        // callback
        console.log(`Appel du callback..`);
        console.log(`Reférence cible :`, ref);

        await Acteur.findByEmail(ref).then(async acteur => {
            if (!acteur) throw `Acteur non trouvé !`;
            await Particulier.setAtsgoIdClient(acteur.e_particulier, idClient).then(async particulier => {
                if (!particulier) throw `Erreur à l'enregistrement du compte titre !`;
                console.log('Données du callback envoyé');
            }).catch(error => { throw error });
        }).catch(error => { throw error });

    }).catch(error => { throw error });
}

async function validationAtsgoOperation(apikey, idClient, idOperationClient) {

    console.log(`Validation de l'operation atsgo..`)

    const headers =  {
        "Content-Type": "application/json",
    }

    await fetch(process.env.ATSGO_URL + process.env.URI_CLIENT_OPERATION_VALIDATE + '?ApiKey=' + apikey, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({idClient, idOperationClient}),
    })
    .then(resp => resp.json())
    .then(async validate => {
        if (validate.status!=200) {
            console.log(validate.errors);
            throw "Erreur lors de la validation de l'operation atsgo !";
        } 
        console.log(`Validation de l'operation terminé`);
        // callback
        // console.log(`Appel du callback..`);
        // console.log(`Reférence cible :`, ref);
    }).catch(error => { throw error });
}



module.exports = Atsgo;