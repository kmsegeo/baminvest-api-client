const db = require('../config/database');

const CampagneQuestion = {

    tableName: `t_risque_questions`,
    
    async findById(id) {
        const queryString = `
            SELECT r_i, r_reference, r_intitule, r_ordre, r_description, r_points_totale, r_avec_colonne, e_profil_partie
            FROM ${this.tableName} 
            WHERE r_i=$1 AND r_statut=$2`;
        const res = db.query(queryString, [id, 1]);
        return (await res).rows[0];
    },

    async findByRef(ref) {
        const queryString = `
            SELECT r_i, r_reference, r_intitule, r_ordre, r_description, r_points_totale, r_avec_colonne 
            FROM ${this.tableName} 
            WHERE r_reference=$1 AND r_statut=$2`;
        const res = db.query(queryString, [ref, 1]);
        return (await res).rows[0];
    },

    async findAllByPartie(partie) {
        const queryString = `
            SELECT r_i, r_reference, r_intitule, r_ordre, r_description, r_points_totale, r_avec_colonne  
            FROM ${this.tableName} 
            WHERE e_profil_partie=$1 AND r_statut=$2`;
        const res = db.query(queryString, [partie, 1]);
        return (await res).rows;
    },
}

module.exports = CampagneQuestion;