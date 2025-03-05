const db = require('../config/database');

const PersonEmergency = {

    tableName: 't_personne_contacter',

    async create(particulier, {nom_prenom, intitule, telephone_fixe, telephone_mobile, email}) {
        const res = db.query(`
            INSERT INTO ${this.tableName} (
                r_nom_prenom,
                r_intitule,
                r_telephone_fixe,
                r_telephone_mobile,
                r_email,
                e_particulier) 
            VALUES($1,$2,$3,$4,$5,$6)
            RETURNING *`, [nom_prenom, intitule, telephone_fixe, telephone_mobile, email, particulier]);
        return (await res).rows[0];
    }, 

    async findAllByParticulier(particulier) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_particulier=$1`, [particulier]);
        return (await res).rows;
    }
}

module.exports = PersonEmergency;