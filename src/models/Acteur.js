const db = require('../config/database');

const Acteur = {  

  tableName: 't_acteur',

  async create({nom_complet, email, telephone, adresse, type_acteur, mdp, signataire, entreprise, represantant, particulier, rib, langue}) {

    console.log(nom_complet, email, telephone, adresse, type_acteur, mdp, signataire, entreprise, represantant, particulier, rib, langue);
    
    const queryString = `
      INSERT INTO ${this.tableName} (
        r_nom_complet,
        r_email,
        r_telephone_prp,
        r_telephone_scd,
        r_adresse,
        r_statut,
        r_date_creer,
        r_date_modif,
        e_type_acteur,
        r_mdp,
        e_signataire,
        e_entreprise,
        e_represantant,
        e_particulier,
        r_rib,
        r_langue) 
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING 
        r_nom_complet, 
        r_email, 
        r_telephone_prp, 
        r_telephone_scd, 
        r_adresse, 
        r_statut, 
        r_date_creer, 
        r_date_modif,
        e_type_acteur,
        e_signataire,
        e_entreprise,
        e_represantant
        e_particulier,
        r_rib,
        r_langue`;

        const create_date = new Date();

        const res = await db.query(queryString, [
          nom_complet, 
          email, 
          telephone, 
          null, 
          adresse, 
          0, 
          create_date, 
          create_date, 
          type_acteur, 
          mdp, 
          signataire, 
          entreprise, 
          represantant, 
          particulier, 
          rib, 
          langue]);

      return res.rows[0];
  },

  async findById(id) {
    
      const queryString = `
        SELECT 
          r_nom_complet, 
          r_email, 
          r_telephone_prp, 
          r_telephone_scd, 
          r_adresse, 
          r_statut,
          r_date_creer, 
          r_date_modif, 
          r_date_activation,
          e_type_acteur,
          e_signataire,
          e_entreprise,
          e_represantant,
          e_particulier,
          r_rib, 
          profil_investisseur,
          r_langue
        FROM ${this.tableName} 
        WHERE r_i = $1`;

      const res = await db.query(queryString, [id]);
      return res.rows[0];
  },

  async findByEmail(email) {

    const queryString = `
      SELECT 
        r_i,
        r_nom_complet, 
        r_email, 
        r_telephone_prp, 
        r_telephone_scd, 
        r_adresse, 
        r_statut,
        r_date_creer, 
        r_date_modif, 
        r_date_activation,
        e_type_acteur,
        e_signataire,
        e_entreprise,
        e_represantant,
        e_particulier,
        r_rib, 
        profil_investisseur,
        r_langue,
        r_mdp 
      FROM ${this.tableName} 
      WHERE r_email = $1`;
      
    const res = await db.query(queryString, [email]);
    return res.rows[0];
  },

  async findAllByTypeActeur(typeActeur) {
    const res = await db.query(`SELECT * FROM ${this.tableName} WHERE e_type_acteur=$1`, [typeActeur]);
    return res.rows;
  },

  async findAllByProfil(profil) {
    const res = await db.query(`
      SELECT act.*, agt.e_profil 
      FROM ${this.tableName} As act 
      INNER JOIN t_agent As agt 
      ON act.e_agent=agt.r_i 
      WHERE agt.e_profil=$1`, [profil]);
    return res.rows;
  },
  
  async update(id, {civilite, nom, prenom}) {
    const queryString = `UPDATE ${this.tableName} SET ... WHERE r_i=$4 RETURNING r_civilite, r_nom, r_prenom`;
    const res = await db.query(queryString, [civilite, nom, prenom, id])
    return res.rows[0];
  },

  async updateProfilInvestisseur(acteur_id, profil) {
    const queryString = `UPDATE ${this.tableName} SET profil_investisseur=$1 WHERE r_i=$2 RETURNING r_i,
        r_nom_complet, 
        r_email, 
        r_telephone_prp, 
        r_telephone_scd, 
        r_adresse, 
        r_statut,
        r_date_creer, 
        r_date_modif, 
        r_date_activation,
        e_type_acteur,
        e_signataire,
        e_entreprise,
        e_represantant,
        e_particulier,
        r_rib, 
        profil_investisseur,
        r_langue`;
    const res = await db.query(queryString, [profil, acteur_id])
    return res.rows[0];
  }

}

module.exports = Acteur;