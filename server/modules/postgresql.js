"use strict";
const pg = require('pg');

let postgresConnection = () => {
  pg.defaults.ssl = true;
  return new Promise((resolve, reject) => {
    pg.connect(process.env.POSTGRES_URL, function(err, client) {
      if (err) reject(err);

      console.log('Connected to postgres! Getting schemas...');
      resolve(client);
      // client
      //   .query('SELECT table_schema,table_name FROM information_schema.tables;')
      //   .on('row', function(row) {
      //     console.log(JSON.stringify(row));
      //   });
    });
  });
 }

module.exports = { postgresConnection };
