const db = require('../config/database');

const CampagneReponse = {

    tableName: `t_risque_reponses`,

    async findById(id) {
        const queryString = `
            SELECT r_i, r_reference, r_intitule, r_ordre, r_details, r_points FROM ${this.tableName} WHERE r_i=$1 AND r_statut=$2`;
        const res = db.query(queryString, [id, 1]);
        return (await res).rows[0];
    },

    async findByRef(ref) {
        const queryString = `
            SELECT r_i, r_reference, r_intitule, r_ordre, r_details, r_points FROM ${this.tableName} WHERE r_reference=$1 AND r_statut=$2`;
        const res = db.query(queryString, [ref, 1]);
        return (await res).rows[0];
    },

    async findAllByLineColumn(q) {
        const queryString = `SELECT r_i, r_reference, r_intitule, r_ordre, r_details, r_points FROM ${this.tableName} WHERE e_ligne_colonne=$1 AND r_statut=$2 ORDER BY r_i ASC`;
        const res = db.query(queryString, [q, 1]);
        return (await res).rows;
    }
    
}

module.exports = CampagneReponse;