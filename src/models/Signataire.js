const db = require('../config/database');

const Signataire = {

    tableName: 't_signataire',

    async create({civilite, nom, nom_jeune_fille, prenom, poids, qualite, date_pouvoir, date_echeance}) {
        const res = db.query(`
            INSERT INTO ${this.tableName} (
                r_civilite,
                r_nom,
                r_nom_jeune_fille,
                r_prenom,
                r_poids,
                r_qualite,
                r_date_pouvoir,
                r_date_echeance) 
            VALUES($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *`, [civilite, nom, nom_jeune_fille, prenom, poids, qualite, date_pouvoir, date_echeance]);
        return (await res).rows[0];
    }, 

    async findById(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return (await res).rows[0];
    }
}

module.exports = Signataire;