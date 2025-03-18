const db = require('../config/database');

const CampagnePartie = {

    tableName: `t_profil_risque_partie`,

    async findById(id) {
        const queryString = `
            SELECT r_i, r_reference, r_intitule, r_ordre, r_description, r_points_totale, e_campagne
            FROM ${this.tableName} 
            WHERE r_i=$1 AND r_statut=$2`;
        const res = db.query(queryString, [id, 1]);
        return (await res).rows[0];
    },

    async findByRef(ref) {
        const queryString = `
            SELECT r_i, r_reference, r_intitule, r_ordre, r_description, r_points_totale 
            FROM ${this.tableName} 
            WHERE r_reference=$1 AND r_statut=$2`;
        const res = db.query(queryString, [ref, 1]);
        return (await res).rows[0];
    },

    async findAllByCampgagne(campagne) {
        const queryString = `
            SELECT r_i, r_reference, r_intitule, r_ordre, r_description, r_points_totale 
            FROM ${this.tableName} 
            WHERE e_campagne=$1 AND r_statut=$2 ORDER BY r_i ASC`;
        const res = db.query(queryString, [campagne, 1]);
        return (await res).rows;
    }
}

module.exports = CampagnePartie;