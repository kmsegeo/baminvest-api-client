const db = require('../config/database');

const Representant = {

    tableName: 't_representant',

    async create({civilite, nom, nom_jeune_fille, prenom, date_naissance, nationalite, type_piece, num_piece, fonction}) {

        const res = db.query(`
            INSERT INTO ${this.tableName}
                (r_civilite,
                r_nom,
                r_nom_jeune_fille,
                r_prenom,
                r_date_naissance,
                r_nationalite,
                r_type_piece,
                r_num_piece,
                r_fonction)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`, [civilite, nom, nom_jeune_fille, prenom, date_naissance, nationalite, type_piece, num_piece, fonction]);
        return (await res).rows[0];
    },

    async findById(id) {
        const res = await db.query(`SELECT * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return res.rows[0];
    }
}

module.exports = Representant;