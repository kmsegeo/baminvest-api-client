const db = require('../config/database');

const OTP = {

    tableName: "t_otp",

    // async findLastInput() {
    //     const res = await db.query(`SELECT * FROM ${this.tableName} ORDER BY r_i DESC LIMIT 1`, []);
    //     return res.rows[0];
    // },

    async create(acteur, {msgid, code_otp}) {

        const date = new Date();

        const res = await db.query(`
            INSERT INTO ${this.tableName} (
                r_msgid, 
                r_code_otp, 
                r_statut, 
                r_date_creer, 
                r_date_modif,
                e_acteur)
            VALUES($1,$2,$3,$4,$5,$6) RETURNING *`, [msgid, code_otp, 0, date, date, acteur]);
        return res.rows[0];
    },
    
    async findByActeurId(acteurId) {
        const res = await db.query(`SELECT * FROM ${this.tableName} WHERE e_acteur=$1 AND r_statut=$2 ORDER BY r_i DESC`, [acteurId, 0]);
        return res.rows[0];
    },
    
    async confirm(acteurId) {
        const res = await db.query(`
            UPDATE ${this.tableName} 
            SET r_statut=$1,
                r_date_modif=$2
            WHERE e_acteur=$3`, [1, new Date(), acteurId]);
        return res.rows[0];
    },

    async clean(acteur_id) {
        const res = await db.query(`
            UPDATE ${this.tableName} 
            SET r_statut=$1,
                r_date_modif=$2
            WHERE e_acteur=$3`, [2, new Date(), acteur_id]);
        return res.rows;
    }

}

module.exports = OTP;