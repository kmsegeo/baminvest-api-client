const db = require('../config/database');

const Campagne = {

    tableName: `t_campagne_demande`,

    async findAll() {
        const queryString = `
            SELECT r_code, r_intitule, r_description, r_periodicite, r_date_debut, r_date_fin, r_cible FROM ${this.tableName} WHERE r_statut=$1`;
        const res = db.query(queryString, [1]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `SELECT r_i, r_code, r_intitule, r_description, r_periodicite, r_date_debut, r_date_fin, r_cible FROM ${this.tableName} WHERE r_i=$1 AND r_statut=$2`;
        const res = db.query(queryString, [id, 1]);
        return (await res).rows[0];
    },

    async findByCode(code) {
        const queryString = `SELECT r_i, r_code, r_intitule, r_description, r_periodicite, r_date_debut, r_date_fin, r_cible FROM ${this.tableName} WHERE r_code=$1 AND r_statut=$2`;
        const res = db.query(queryString, [code, 1]);
        return (await res).rows[0];
    },
    
    async findByintitule(intitule) {
        const queryString = `SELECT r_i, r_code, r_intitule, r_description, r_periodicite, r_date_debut, r_date_fin, r_cible FROM ${this.tableName} WHERE r_intitule=$1 AND r_statut=$2`;
        const res = db.query(queryString, [intitule, 1]);
        return (await res).rows[0];
    },

}

module.exports = Campagne;