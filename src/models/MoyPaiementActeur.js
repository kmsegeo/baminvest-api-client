const db = require('../config/database');

const MoyPaiementActeur = {

    tableName: `t_moyen_paiement_acteur`,

    async findAll() {
        const queryString = `
            SELECT * FROM ${this.tableName} WHERE r_statut=$1`;
        const res = db.query(queryString, [1]);
        return (await res).rows;
    },

    async create(acteur, type_moypaiement, {valeur, intitule}) {
        const date = new Date();
        const res = await db.query(`
            INSERT INTO ${this.tableName} (r_valeur, r_intitule, r_date_creer, r_date_modif, r_statut, e_acteur, e_type_moypaiement)
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`, [valeur, intitule, date, date, 1, acteur, type_moypaiement]);
            return res.rows[0];
    },

    async findById(id) {
        const queryString = ` SELECT * FROM ${this.tableName} WHERE r_i=$1 AND r_statut=$2`;
        const res = db.query(queryString, [id, 1]);
        return (await res).rows[0];
    },

    async findByValeur(valeur) {
        const queryString = `
            SELECT r_i, r_valeur, r_intitule, e_acteur, e_type_moypaiement
            FROM ${this.tableName} 
            WHERE r_valeur=$1`;
        const res = db.query(queryString, [valeur]);
        return (await res).rows[0];
    },

    async update(id, type_moypaiement, {valeur, intitule}) {
        const res = await db.query(`
            UPDATE ${this.tableName} 
            SET r_valeur=$1, 
                r_intitule=$2, 
                r_date_modif=$3, 
                e_type_moypaiement=$4
            WHERE r_i=$5
            RETURNING *`, [valeur, intitule, new Date(), type_moypaiement, id]);
            return res.rows[0];
    },

    async findAllByActeur(id) {
        const queryString = `
            SELECT * FROM ${this.tableName} WHERE e_acteur=$1 AND r_statut=$2`;
        const res = db.query(queryString, [id, 1]);
        return (await res).rows;
    }
}

module.exports = MoyPaiementActeur;