const db = require('../config/database');

const FAQ = {

    tableName: 't_faq',

    async findAll() {
        const res = await db.query(`SELECT r_i, r_question, r_reponse FROM ${this.tableName} WHERE r_statut=$1 ORDER BY r_i ASC`, [1]);
        return res.rows;
    }, 

    async create({ question, reponse }) {
        const create_date = new Date();
        const res = await db.query(`INSERT INTO ${this.tableName}
            (r_question, r_reponse, r_date_creer, r_date_modif, r_statut)
            VALUES($1, $2, $3, $4, $5) RETURNING r_i, r_question, r_reponse`, 
            [question, reponse, create_date, create_date, 1]);

        return res.rows[0];
    },

    async findById(id) { 
        const res = await db.query(`SELECT r_i, r_question, r_reponse 
            FROM ${this.tableName} WHERE r_i=$1 AND r_statut=$2`, [id, 1]);
        return res.rows[0];
    },

    async update(id, { question, reponse }) {
        const update_date = new Date();
        const res = await db.query(`UPDATE ${this.tableName}
            SET r_question=$1, r_reponse=$2, r_date_modif=$3
            WHERE r_i=$4 RETURNING 
            r_i, r_question, r_reponse`, 
            [question, reponse, update_date, id]);

        return res.rows[0];
    },

    async delete(id) {
        const update_date = new Date();
        const res = await db.query(`UPDATE ${this.tableName}
            SET r_statut=$1, r_date_modif=$2
            WHERE r_i=$3 RETURNING r_i`, 
            [0, update_date, id]);

        return res.rows[0];
    }

}

module.exports = FAQ;