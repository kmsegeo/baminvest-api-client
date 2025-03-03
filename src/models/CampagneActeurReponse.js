const db = require('../config/database');

const ActeurReponse  = {

    tableName: 't_profil_risque_acteur',

    async findAllByActeurId(id) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_acteur=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows;
    }
}

module.exports = ActeurReponse;