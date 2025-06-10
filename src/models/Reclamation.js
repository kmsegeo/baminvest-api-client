const db = require('../config/database');

const Reclamation = {

    tableName: 't_reclamation',

    async findActeurAll(acteur_id) {
        const res = await db.query(`SELECT * FROM ${this.tableName} WHERE e_acteur=$1`, [acteur_id]);
        return res.rows;
    },

    async create(acteur, {objet, description, document}) {
        const res = await db.query(`
            INSERT INTO ${this.tableName} 
                (r_objet, 
                 r_description, 
                 r_statut,
                 r_date_creer, 
                 e_acteur, 
                 e_document) 
            VALUES($1,$2,$3,$4,$5,$6) 
            RETURNING *`, [objet, description, 0, new Date(), acteur, document]);

        return res.rows[0];
    }
}

module.exports = Reclamation;