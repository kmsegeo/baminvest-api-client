const db = require('../config/database');
const TypeOperation = require('../models/TypeOperation');

const Utils = {
    
    async generateCode(prefix, db_table, column, spliter) {
        
        /**
         * [x] Récupération du code de la table passé en argument
         * [x] Si aucune valeur trouvée: retourner un code inittialisé 
         * [x] Sinon: spliter et incrémenter le surfix de 1, pour constituer un nouveau code
         */

        const queryStrind = `SELECT ${column} FROM ${db_table} ORDER BY r_i DESC LIMIT 1`;
        const result = db.query(queryStrind);
        const row = (await result).rows[0];

        if (!row) return `${prefix}${spliter}001`;

        const code = row[column];
        const surfix = code.split(spliter)[1];
        const n_surfix = parseInt(surfix) + 1;
        
        return prefix + spliter + (n_surfix<10 ? '00' + n_surfix : n_surfix<100 ? '0' + n_surfix : n_surfix);
    },

    async expectedParameters(expected) {
        for (const [key, value] of Object.entries(expected)) {
            if (!value) throw `Le paramètre - ${key} - attendu est absent !`;
        }
    },

    async selectTypeOperation(operation) {
        const data = ['Souscription', 'Rachat', 'Transfert'];
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            if (operation.toLowerCase()==d.toLowerCase()) 
                return await TypeOperation.findCodeByIntitule(d);
        }
        return operation;
    }
    
}

module.exports = Utils;