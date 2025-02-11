const db = require('../config/database');
const uudi = require('uuid');

const Particulier = {

    tableName: 't_kyc_particulier',

    async findByParticulierId(id) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_particulier=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    },

    async create(particulier, {
        autres_contexte_ouv,
        contexte_ouverture_compte,
        raisons_ouverture_compte,
        ouverture_compte,
        lien_parente_sgo,
        civilite,
        nom_prenom_titulaire,
        date_naissance,
        pays_naissance,
        pays_residence,
        situation_matrimoniale,
        telephone,
        email,
        situation_habitat,
        categorie_professionnelle,
        autres_categorie_prof,
        profession,
        employeur,
        nbr_enfants,
        langue_preferee,
        instrument_paiement_privilige,
        origine_ressources_investies,
        autres_origines_ressources,
        tranche_revenus,
        autres_actifs,
        autres_actifs_preciser,
        autres_comptes_bridge,
        comptes_bridges,
        banques_relations,
        activites_politiques,
        preciser_activite_politiq,
        proche_politicien,
        preciser_proche_politicien}) {
        
        const queryString = `INSERT INTO ${this.tableName} 
            (r_reference,
            r_autres_contexte_ouv,
            r_contexte_ouverture_compte,
            r_raisons_ouverture_compte,
            r_ouverture_compte,
            r_lien_parente_sgo,
            r_civilite,
            r_nom_prenom_titulaire,
            r_date_naissance,
            r_pays_naissance,
            r_pays_residence,
            r_situation_matrimoniale,
            r_telephone,
            r_email,
            r_situation_habitat,
            r_categorie_professionnelle,
            r_autres_categorie_prof,
            r_profession,
            r_employeur,
            r_nbr_enfants,
            r_langue_preferee,
            r_instrument_paiement_privilige,
            r_origine_ressources_investies,
            r_autres_origines_ressources,
            r_tranche_revenus,
            r_autres_actifs,
            r_autres_actifs_preciser,
            r_autres_comptes_bridge,
            r_comptes_bridges,
            r_banques_relations,
            r_activites_politiques,
            r_preciser_activite_politiq,
            r_proche_politicien,
            r_preciser_proche_politicien,
            r_date_modif,
            r_date_cree,
            e_particulier) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37)
            RETURNING *`;
        
        const date_create = new Date();
        const res = await db.query(queryString, [uudi.v4(),
            autres_contexte_ouv,
            contexte_ouverture_compte,
            raisons_ouverture_compte,
            ouverture_compte,
            lien_parente_sgo,
            civilite,
            nom_prenom_titulaire,
            date_naissance,
            pays_naissance,
            pays_residence,
            situation_matrimoniale,
            telephone,
            email,
            situation_habitat,
            categorie_professionnelle,
            autres_categorie_prof,
            profession,
            employeur,
            nbr_enfants,
            langue_preferee,
            instrument_paiement_privilige,
            origine_ressources_investies,
            autres_origines_ressources,
            tranche_revenus,
            autres_actifs,
            autres_actifs_preciser,
            autres_comptes_bridge,
            comptes_bridges,
            banques_relations,
            activites_politiques,
            preciser_activite_politiq,
            proche_politicien,
            preciser_proche_politicien,
            date_create,
            date_create,
            particulier]);

        return res.rows[0];
    },

}

const Entreprise = {

    tableName: 't_kyc_entreprise',

    async createEntreprise() {},

    async findByEntrepriseId(id) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_entreprise=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    },

    async create(entreprise, {contexte_ouverture_compte,
        autres_contexte_ouv,
        raisons_ouverture_compte,
        ouverture_compte,
        raison_sociale,
        secteur_activite,
        activites,
        forme_juridique,
        date_creation,
        siege_social,
        residence_fiscale,
        telephone,
        email,
        qualite,
        document_identification,
        autres_documents_identif,
        num_piece,
        date_exp_piece,
        app_groupe,
        groupe_appart,
        residence_fiscale_groupe,
        nombre_employes,
        capital,
        autres_origines_ressources,
        chiffre_affaire,
        resultat_net,
        autres_comptes_bridge,
        comptes_bridge,
        banques_relations}) {
        
        const queryString = `INSERT INTO ${this.tableName} 
            (r_reference,
            r_contexte_ouverture_compte,
            r_autres_contexte_ouv,
            r_raisons_ouverture_compte,
            r_ouverture_compte,
            r_raison_sociale,
            r_secteur_activite,
            r_activites,
            r_forme_juridique,
            r_date_creation,
            r_siege_social,
            r_residence_fiscale,
            r_telephone,
            r_email,
            r_qualite,
            r_document_identification,
            r_autres_documents_identif,
            r_num_piece,
            r_date_exp_piece,
            r_app_groupe,
            r_groupe_appart,
            r_residence_fiscale_groupe,
            r_nombre_employes,
            r_capital,
            r_autres_origines_ressources,
            r_chiffre_affaire,
            r_resultat_net,
            r_autres_comptes_bridge,
            r_comptes_bridge,
            r_banques_relations,
            r_date_cree,
            r_date_modif,
            e_entreprise) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
            RETURNING *`;
        
        const date_create = new Date();
        const res = await db.query(queryString, [uudi.v4(),
            contexte_ouverture_compte,
            autres_contexte_ouv,
            raisons_ouverture_compte,
            ouverture_compte,
            raison_sociale,
            secteur_activite,
            activites,
            forme_juridique,
            date_creation,
            siege_social,
            residence_fiscale,
            telephone,
            email,
            qualite,
            document_identification,
            autres_documents_identif,
            num_piece,
            date_exp_piece,
            app_groupe,
            groupe_appart,
            residence_fiscale_groupe,
            nombre_employes,
            capital,
            autres_origines_ressources,
            chiffre_affaire,
            resultat_net,
            autres_comptes_bridge,
            comptes_bridge,
            banques_relations,
            date_create,
            date_create,
            entreprise
        ]);

        return res.rows[0];
    },
}

module.exports = {
    Particulier,
    Entreprise
}