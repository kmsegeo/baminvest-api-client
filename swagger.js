const swaggerAutogen = require('swagger-autogen');

const doc = {
    info: {
        title: 'BAM API Client',
        version: process.env.VERSION,
        description: `Api de l'application de fonds commun de placement de Bridge Asset Management`,
    },
    host: 'verolive-secure.com/apibam',
    schemes: ['https']
};

const outpoutFile = './swagger-outpout.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outpoutFile, endpointsFiles, doc).then(()=>{
    require('./app.js');
});