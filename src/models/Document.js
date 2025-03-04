const db = require('../config/database');
const uuid = require('uuid');

const Document = {
    tableName: 't_document',

    async findAllByTypeDocumentId(type_id) {
        const res = db.query(`
            SELECT 
                r_i,
                r_reference,
                r_nom_fichier, 
                r_date_creer, 
                r_date_modif
            FROM ${this.tableName} 
            WHERE e_type_document=$1 AND r_statut=$2`, [type_id, 1]);
        return res.rows
    },

    async create({acteur_id, type_document, nom_fichier}) {
        const date = new Date();
        const res = db.query(`
            INSERT INTO ${this.tableName} (
                r_reference,
                r_date_creer,
                r_date_modif,
                r_statut,
                e_type_document,
                e_acteur,
                r_nom_fichier) 
            VALUES($1,$2,$3,$4,$5,$6,$7)
            RETURNING r_reference,
                r_nom_fichier, 
                r_date_creer, 
                r_date_modif, 
                e_type_document`, [uuid.v4(), date, date, 1, type_document, acteur_id, nom_fichier]);
        return (await res).rows[0];
    },

    async findById(id) {
        const res = db.query(`
            SELECT 
                r_reference,
                r_nom_fichier, 
                r_date_creer, 
                r_date_modif, 
                e_type_document 
            FROM ${this.tableName} 
            WHERE r_i=$1 AND r_statut=$2`, [id, 1]);
        return res.rows
    },

    async findByRef(ref) {
        const res = db.query(`
            SELECT 
                r_reference,
                r_nom_fichier, 
                r_date_creer, 
                r_date_modif, 
                e_type_document 
            FROM ${this.tableName} 
            WHERE r_reference=$1 AND r_statut=$2`, [ref, 1]);
        return res.rows
    },

    async findAllByActeurId(acteur_id) {
        const res = db.query(`
            SELECT 
                r_reference,
                r_nom_fichier, 
                r_date_creer, 
                r_date_modif, 
                e_type_document 
            FROM ${this.tableName} 
            WHERE e_acteur=$1 AND r_statut=$2`, [acteur_id, 1]);
        return res.rows
    },

}

module.exports = Document;