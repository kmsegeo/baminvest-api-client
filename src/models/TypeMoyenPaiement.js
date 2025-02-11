const db = require('../config/database');

const TypeMoyenPaiement = {

    tableName: `t_moyen_paiement`,

    async findAll() {
        const queryString = `
            SELECT r_code, r_intitule, r_type 
            FROM ${this.tableName} WHERE r_statut=$1`;
        const res = db.query(queryString, [1]);
        return (await res).rows;
    },

    async findByCode(code) {
        const queryString = `
            SELECT r_i, r_code, r_intitule, r_type 
            FROM ${this.tableName} 
            WHERE r_code=$1 AND r_statut=$2`;
        const res = db.query(queryString, [code, 1]);
        return (await res).rows[0];
    },
}

module.exports = TypeMoyenPaiement;