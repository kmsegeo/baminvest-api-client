const response = require("../middlewares/response");

const Atsgo = {

    async onbording (res, apikey, client) {

        console.log('Envoi des données à ATSGO..')

        const headers =  {
            "Content-Type": "application/json",
        }
        
        await fetch(process.env.ATSGO_URL + process.env.URI_CLIENT + '?ApiKey=' + apikey, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(client),
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.status!=200) {
                console.log(data.errors);
                throw "Erreur d'enregistrement à atsgo !";
            }
            console.log(data.payLoad);
            // return response(res, 200, "Client atsgo enregistré", data.payLoad);
        }).catch(error => { throw error });
    }

}

module.exports = Atsgo;