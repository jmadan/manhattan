let Bunyan = require('bunyan');
let restify = require('restify');

let log = new Bunyan({
  name: 'Manhattan',
  event: 'after',
  streams: [
    {
      level: 'info',
      stream: process.stdout
    }
    // {
    //   level: 'trace',
    //   path: '../logs/manhattan.log'
    // }
  ],
  serializers: {
    req: Bunyan.stdSerializers.req,
    res: restify.bunyan.serializers.res
  }
});

module.exports = log;
