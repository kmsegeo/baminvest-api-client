const db = require('../config/database');

const PersonnelEntreprise = {

    tableName: 't_personnel_entreprise',

    async create(entreprise, {
            nom, 
            prenom, 
            telephone_mobile, 
            email, 
            fonction,
            pays_residence, 
            signataire, 
            vous_fonction_politique, 
            vous_fonction,
            vous_pays,
            proche_politique,
            proche_fonction,
            proche_pays}) {
        const res = db.query(`
            INSERT INTO ${this.tableName} (
                r_nom,
                r_prenom,
                r_telephone_mobile,
                r_email,
                r_fonction,
                r_pays_residence,
                r_signataire,
                r_vous_fonction_politique,
                r_vous_fonction,
                r_vous_pays,
                r_proche_politique,
                r_proche_fonction,
                r_proche_pays,
                e_entreprise) 
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
            RETURNING *`, [
                nom, 
                prenom, 
                telephone_mobile, 
                email, 
                fonction,
                pays_residence, 
                signataire, 
                vous_fonction_politique, 
                vous_fonction,
                vous_pays,
                proche_politique,
                proche_fonction,
                proche_pays, 
                entreprise]);
        return (await res).rows[0];
    }, 

    async findById(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return (await res).rows;
    }, 

    async findByEntrepriseId(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_entreprise=$1`, [id]);
        return (await res).rows;
    }
}

module.exports = PersonnelEntreprise;