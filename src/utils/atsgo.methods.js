const { validate } = require("uuid");
const response = require("../middlewares/response");

const Atsgo = {

    async onbording (apikey, client) {

        console.log('Envoi des données à ATSGO..')

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
            console.log(data.payLoad);
            await validateAtsgoAccount(apikey, data.payLoad);
        }).catch(error => { throw error });
    }
}

async function validateAtsgoAccount(apikey, data)  {

    const headers =  {
        "Content-Type": "application/json",
    }

    const idClient = data.idClient;

    await fetch(process.env.ATSGO_URL + process.env.URI_CLIENT_VALIDATE + '?ApiKey=' + apikey, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({idClient}),
    })
    .then(resp => resp.json())
    .then(validate => {
        if (validate.status!=200) {
            console.log(validate.errors);
            throw "Erreur lors de l'activation du compte atsgo !";
        }
        console.log(validate)
    }).catch(error => { throw error });
}

module.exports = Atsgo;