const db = require('../config/database');

const CircuitEtape = {

    tableName: 't_etape_validation',

    async findAllByCircuitId(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_circuit_validation=$1`, [id]);
        return (await res).rows;
    },

    async findById(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return (await res).rows[0];
    },

    async findByRef(ref) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_reference=$1`, [ref]);
        return (await res).rows[0];
    },

}

module.exports = CircuitEtape;