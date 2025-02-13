const db = require('../config/database');
const uudi = require('uuid');

const Operation = {

    table_name: 't_operation',
    
    async findAllByActeur(id) {
        const res = await db.query(`SELECT * FROM ${this.table_name} WHERE e_acteur=$1`, [id]);
        return res.rows;
    },

    async create(acteur, type_operation, moyen_paiement, fonds, status, {
        reference_operateur,
        libelle, 
        montant, 
        frais_operation, 
        frais_operateur, 
        compte_paiement}) {
            
        const date = new Date();

        const res = await db.query(`
            INSERT INTO ${this.table_name}
                (r_reference,
                r_reference_operateur, 
                r_date_creer, 
                r_date_modif, 
                r_libelle,
                r_montant,
                r_frais_operation,
                r_frais_operateur,
                r_statut,
                e_acteur,
                e_type_operation,
                e_moyen_paiement,
                compte_paiement,
                e_fonds)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
            RETURNING *`, [
                uudi.v4(), 
                reference_operateur, 
                date, 
                date, 
                libelle, 
                montant, 
                frais_operation, 
                frais_operateur, 
                status, 
                acteur, 
                type_operation, 
                moyen_paiement, 
                compte_paiement, 
                fonds
            ]);

        return res.rows[0];
    }
}

module.exports = Operation;