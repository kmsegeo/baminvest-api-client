const db = require('../config/database');

const CampagneRepMatrice = {

    tableName: `t_reponse_matrice`,
    
    async findByRef(ref) {
        const queryString = `
            SELECT  r_i, r_reference, r_type, r_intitule, r_ordre, r_details FROM ${this.tableName} WHERE r_reference=$1`;
        const res = db.query(queryString, [ref]);
        return (await res).rows[0];
    },

    async findAllByQuestion(question) {
        const queryString = `SELECT r_i, r_reference, r_type, r_intitule, r_ordre, r_details FROM ${this.tableName} WHERE e_risques_questions=$1`;
        const res = db.query(queryString, [question]);
        return (await res).rows;
    }
}

module.exports = CampagneRepMatrice;