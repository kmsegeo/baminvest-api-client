module.exports = {
  apps : [{
    script: 'server.js',
    watch: '.'
  }, ],

  deploy : {
    production : {
      user : 'root',
      host : '192.168.20.38',
      ref  : 'origin/main',
      repo : 'https://github.com/kmsegeo/baminvest-api-client.git',
      path : '/home/bamapps',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
