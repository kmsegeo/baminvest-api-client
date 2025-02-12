const { createHash } = require('crypto');
const response = require("./response");

module.exports = (req, res, next) => {

    try {
        console.log(`Authentification application..`);
        const app_hash = req.headers.appauth;
        const req_hash = appVerifyer(req.headers.app_id, req.headers.op_code, req.headers.timestamp)
        console.log(`Vérification du hash`)
        if (app_hash!=req_hash) 
            throw `Authentification de l'application à échoué !`;

        next(); 

    } catch(error) {
        return response(res, 401, error);
    }
}

function appVerifyer(app_id, op_code, timestamp) {

    const app_mdp = 'mot*de*passe';

    console.log(`Vérification du canal`);
    /* à faire */
    
    console.log(`Vérification du code d'opération`);
    /* à faire */

    const str = op_code + app_id + timestamp + app_mdp;
    return createHash("SHA256").update(str).digest('base64');
}