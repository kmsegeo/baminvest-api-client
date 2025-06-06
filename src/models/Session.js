const db = require('../config/database');
const uudi = require('uuid');

const Session = {

    tableName: 't_session',

    async create({os, adresse_ip, marque_device, model_device, autres, acteur}) {

        const queryString = `INSERT INTO ${this.tableName}(\
            r_reference, \
            r_date_creer, \
            r_date_actul, \
            r_os, \
            r_adresse_ip, \
            r_marque_device, \
            r_model_device, \
            r_autres, \
            e_acteur, \
            r_statut) \ 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [uudi.v4(), date, date, os, adresse_ip, marque_device, model_device, autres, acteur, 1]);
        return (await res).rows[0];
    },

    async findAllByActeur(acteur) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_acteur=$1 AND r_statut=$2`;
        let res = db.query(queryString, [acteur, 1]);
        return (await res).rows;
    },
    
    async findByRef(ref) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE r_reference=$1`;
        const res = db.query(queryString, [ref]);
        return (await res).rows[0];
    },

    async refresh(ref) {
        const queryString = `UPDATE ${this.tableName} SET r_date_actul=$1 WHERE r_reference=$2 AND r_statut=$3`;
        const now = new Date();
        const res = db.query(queryString, [now, ref, 1]);
        return (await res).rows[0];
    },

    async destroy({acteur, ref}) {
        const queryString = `UPDATE ${this.tableName} SET r_statut=$1 WHERE e_acteur=$2 AND r_reference=$3`;
        db.query(queryString, [0, acteur, ref]);
        return null;
    }
}

module.exports = Session;