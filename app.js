const errorhandling = require('./src/middlewares/error_handler');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger-outpout.json');
const authRoutes = require('./src/routes/auth_routes');
const ressouceRoutes = require('./src/routes/ressources_routes');
const acteurRoutes = require('./src/routes/acteur_routes');
const fondsRoutes = require('./src/routes/fonds_routes');
const moyenPaiementRoutes = require('./src/routes/moyen_paiement_routes');
const newsRoutes = require('./src/routes/news_routes');
const clientRoutes = require('./src/routes/client_routes');
const path = require('path');
const filesRoutes = require('./src/routes/files_routes');

const app = express(); 

app.use(cors()); 
app.use(express.json()); 

// Routes

const base_path = '/v1'; 

app.use(base_path + '/auth', authRoutes); 
app.use(base_path + '/ressources', ressouceRoutes); 
app.use(base_path + '/acteurs', acteurRoutes); 
app.use(base_path + '/fonds', fondsRoutes); 
app.use(base_path + '/moy_paiements', moyenPaiementRoutes); 
app.use(base_path + '/news', newsRoutes); 
app.use(base_path + '/fichiers', filesRoutes); 

app.use(base_path + '/temp', clientRoutes); 

app.use(`/uploads`, express.static(path.join(__dirname, 'uploads')));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument)); 
app.use(base_path + '/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument)); 

// Error handling middlware 

app.use(errorhandling); 

module.exports = app; 