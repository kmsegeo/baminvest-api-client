const db = require('../config/database');

const CircuitValidation = {

    tableName: `t_circuit_validation`,

    async findAll() {
        const queryString = `SELECT * FROM ${this.tableName}`;
        const res = db.query(queryString, []);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `
            SELECT r_reference, 
                r_intitule, 
                r_description, 
                r_scalable, 
                r_statut,
                e_type_operation 
            FROM ${this.tableName} 
            WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }, 

    async findByRef(ref) {
        const queryString = `
            SELECT * FROM ${this.tableName} 
            WHERE r_reference=$1`;
        const res = db.query(queryString, [ref]);
        return (await res).rows[0];
    },

    async findAllByTypeOperation(type_operation) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_type_operation=$1`;
        const res = db.query(queryString, [type_operation]);
        return (await res).rows[0];
    }
    
}

module.exports = CircuitValidation;