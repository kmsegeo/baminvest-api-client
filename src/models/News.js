const db = require('../config/database');

const News = {

    tableName: 't_news',

    async findAll() {
        const res = await db.query(`SELECT 
                r_i,
                r_titre, 
                r_article, 
                r_date_creer, 
                r_date_modif, 
                e_document
                FROM ${this.tableName} WHERE r_statut=$1`, [1]);
        return res.rows;
    },

    async save(acteur, {r_titre, r_article, e_document}) {
        const date = new Date();
        const res = await db.query(`
            INSERT INTO ${this.tableName} (
                r_titre, 
                r_article, 
                r_statut, 
                r_date_creer, 
                r_date_modif, 
                e_document, 
                e_acteur) 
            VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [r_titre, r_article, 1, date, date, e_document, acteur]);
        return res.rows[0];
    },

    async findById(id) {
        const res = await db.query(`SELECT  r_i,
                r_titre, 
                r_article, 
                r_date_creer, 
                r_date_modif, 
                e_document
            FROM ${this.tableName} WHERE r_i=$1 AND r_statut=$2`, [id, 1]);
        return res.rows[0];
    },

    async update(id, {r_titre, r_article, e_document}) {
        const res = await db.query(`UPDATE ${this.tableName} 
            SET r_titre=$1, 
                r_article=$2, 
                r_date_modif=$3, 
                e_document=$4 
            WHERE r_i=$5`, [r_titre, r_article, new Date(), e_document, id]);
        return res.rows[0];
    },

    async delete(id) {
        const res = await db.query(`UPDATE ${this.tableName} SET r_statut=$1 WHERE r_i=$2 RETURNING *`, [0, id]);
        return res.rows[0];
    }
}

module.exports = News;