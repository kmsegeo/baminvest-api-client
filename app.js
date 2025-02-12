const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger-outpout.json');
const errorhandling = require('./src/middlewares/error_handler');
const typeActeurRoutes = require('./src/routes/type_acteur_routes');
const acteurRoutes = require('./src/routes/acteur_routes');
const clientRoutes = require('./src/routes/client_routes');
const fondsRoutes = require('./src/routes/fonds_routes');
const paiementRoutes = require('./src/routes/paiement_routes');
const operationRoutes = require('./src/routes/operation_routes');

const app = express();

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, AppAuth');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//     next();
// });

app.use(cors());
app.use(express.json());

// Routes

const default_path = ''

app.use(default_path + '/t-acteurs', typeActeurRoutes);
app.use(default_path + '/acteurs', acteurRoutes);
app.use(default_path + '/clients', clientRoutes);
app.use(default_path + '/fonds', fondsRoutes);
app.use(default_path + '/paiements', paiementRoutes);
app.use(default_path + '/operations', operationRoutes);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Error handling middlware

app.use(errorhandling);

module.exports = app;