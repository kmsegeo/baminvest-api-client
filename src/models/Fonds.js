const db = require('../config/database');

const Fonds = {

    tableName: 't_fonds',

    async findAll() {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_statut=$1`, [1]);
        return (await res).rows;
    },

    async findById(id) {
        const res = db.query(`
            SELECT 
                r_reference, 
                r_intitule, 
                r_description, 
                r_statut, 
                commission_souscription, 
                commission_sortie
            FROM ${this.tableName}
            WHERE r_i=$1 AND r_statut=$2`, [id, 1]);
        return (await res).rows[0];
    },

    async findByRef(ref) {
        const res = db.query(`
            SELECT r_i,
                r_reference, 
                r_intitule, 
                r_description, 
                r_statut, 
                commission_souscription, 
                commission_sortie
            FROM ${this.tableName}
            WHERE r_reference=$1 AND r_statut=$2`, [ref, 1]);
        return (await res).rows[0];
    }
    
}

module.exports = Fonds;