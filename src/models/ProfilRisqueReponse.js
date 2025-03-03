const db = require('../config/database');

const ProfilRisqueReponse = {

    tableName: 't_profil_risque_acteur',

    async findAllByActeur(acteur_id) {
        const res = await db.query(`SELECT r_points, e_risques_questions, e_risque_reponse FROM ${this.tableName} WHERE e_acteur=$1`, [acteur_id]);
        return res.rows;
    },

    async create(points, acteur_id, {question_id, reponse_id}) {
        
        const date = new Date();

        const res = await db.query(`
            INSERT INTO ${this.tableName} 
                (r_points,
                 e_risques_questions, 
                 e_risque_reponse, 
                 r_date_cree,
                 r_date_modif,
                 e_acteur)
            VALUES($1,$2,$3,$4,$5,$6) RETURNING *`, [
                points, 
                question_id, 
                reponse_id, 
                date, 
                date, 
                acteur_id]);

        return res.rows[0];
    },

    async findByQuestionId(acteur_id, question_id) {
        const res = await db.query(`SELECT * FROM ${this.tableName} WHERE e_risques_questions=$1 AND e_acteur=$2`, [question_id, acteur_id]);
        return res.rows[0];
    },

    async update(points, acteur_id, {question_id, reponse_id}) {
        const res = await db.query(`
            UPDATE ${this.tableName} 
            SET r_points=$1, e_risque_reponse=$2, r_date_modif=$3
            WHERE e_risques_questions=$4 AND e_acteur=$5`, [points, reponse_id, new Date(), question_id, acteur_id]);
        return res.rows[0];
    }

}

module.exports = ProfilRisqueReponse;