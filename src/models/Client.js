const db = require('../config/database');

const TypeActeur = {
    
    table_name: 't_type_acteur',

    async findAll() {
        const query_string = `SELECT r_code, r_intitule, r_description FROM ${this.table_name}`;
        const res = await db.query(query_string);
        return res.rows;
    }
}

const Particulier = {

    table_name: 't_particulier',

    async create({civilite, nom, nom_jeune_fille, prenom, date_naissance,  nationalite, type_piece, num_piece, type_compte}) {
        
        const query_string = `INSERT INTO ${this.table_name} 
            (
                r_civilite,
                r_nom,
                r_nom_jeune_fille,
                r_prenom,
                r_date_naissance, 
                r_nationalite,
                r_type_piece,
                r_num_piece,
                r_type_compte
            ) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`;
        
        const res = await db.query(query_string, [civilite, nom, nom_jeune_fille, prenom, date_naissance, nationalite, type_piece, num_piece, type_compte]);
        return res.rows[0];
    },

    async findById(id) {
        const query_string = `SELECT * FROM ${this.table_name} WHERE r_i=$1`;
        const res = await db.query(query_string, [id]);
        return res.rows[0];
    },

    async update(id, {civilite, nom, nom_jeune_fille, prenom, date_naissance, nationalite, type_piece, num_piece, type_compte}) {

        const query_string = `UPDATE ${this.table_name} 
            SET civilite=$1, 
                nom=$2, 
                nom_jeune_fille=$3, 
                prenom=$4, 
                date_naissance=$5, 
                nationalite=$6, 
                type_piece=$7, 
                num_piece=$8, 
                type_compte=$9  
            WHERE r_i=$10
            RETURNING *`;

        const res = await db.query(query_string, [civilite, nom, nom_jeune_fille, prenom, date_naissance,  nationalite, type_piece, num_piece, type_compte, id]);
        return res.rows[0];
    }
}

const Entreprise = {

    table_name: 't_entreprise',

    async create({raison_sociale, forme_juridique, capital_social, siege_social, compte_contribuable, registre_com}) {
        
        const query_string = `INSERT INTO ${this.table_name} 
            (
                r_raison_sociale,
                r_forme_juridique,
                r_capital_social,
                r_siege_social,
                r_compte_contribuable,
                r_registre_com
            ) 
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *`;

        const res = await db.query(query_string, [raison_sociale, forme_juridique, capital_social, siege_social, compte_contribuable, registre_com]);
        return res.rows[0];
    },

    async findById(id) {
        const query_string = `SELECT * FROM ${this.table_name} WHERE r_i=$1`;
        const res =  await db.query(query_string, [id]);
        return res.rows[0];
    },

    async update(id, {raison_sociale, forme_juridique, capital_social, siege_social, compte_contribuable, registre_com}) {

        const query_string = `UPDATE ${this.table_name} 
            SET r_raison_sociale=$1,
                r_forme_juridique=$2,
                r_capital_social=$3,
                r_siege_social=$4,
                r_compte_contribuable=$5,
                r_registre_com=$6
            WHERE r_i=$7
            RETURNING *`;

        const res = await db.query(query_string, [raison_sociale, forme_juridique, capital_social, siege_social, compte_contribuable, registre_com, id]);
        return res.rows[0];
    }

}

module.exports = {
    Particulier,
    Entreprise,
    TypeActeur
}