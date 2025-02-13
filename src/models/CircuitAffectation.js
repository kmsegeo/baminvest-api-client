const db = require('../config/database');
const uuid = require('uuid');

const CircuitAffectation = {

    tableName: 't_affectation',

    async findAllByCircuitId(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_circuit_validation=$1`, [id]);
        return (await res).rows;
    },

    async create(e_circuit_validation, e_operation, e_acteur) {

        const date = new Date();

        const res = db.query(`
            INSERT INTO ${this.tableName}
                (r_reference,
                r_date_creer,
                r_date_modif,
                e_acteur,
                e_circuit_validation,
                r_statut,
                e_operation)
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`, [
                uuid.v4(),
                date,
                date,
                e_acteur,
                e_circuit_validation,
                1,
                e_operation]);
                
        return (await res).rows[0];
    },

    async findById(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return (await res).rows[0];
    },

    async findByRef(ref) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_reference=$1`, [ref]);
        return (await res).rows[0];
    },

    async update(r_reference, e_circuit_validation, e_operation, {e_acteur}) {

        const res = db.query(`
            UPDATE ${this.tableName}
            SET r_date_modif=$1,
                e_acteur=$2,
                e_circuit_validation=$3,
                e_operation=$4
            WHERE r_reference=$5
            RETURNING *`, [new Date(), e_acteur, e_circuit_validation, e_operation, r_reference]);

        return (await res).rows[0];
    }
}

module.exports = CircuitAffectation;