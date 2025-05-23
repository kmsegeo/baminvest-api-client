const swaggerAutogen = require('swagger-autogen');

const doc = {
    info: {
        title: 'BAM API Client',
        version: process.env.VERSION,
        description: `Api client de l'application de fonds commun de placement de Bridge Asset Management`,
    },
    // host: 'verolive-secure.com/apibam',
    host: 'bam.mediasoftci.net/api/bamclient',
    // host: '172.10.10.57/api/bamclient',
    schemes: ['https']
};

const outpoutFile = './swagger-outpout.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outpoutFile, endpointsFiles, doc).then(()=>{
    require('./app.js');
});