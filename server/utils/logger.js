let Bunyan = require('bunyan');

let log = new Bunyan({
  name: 'Manhattan',
  event: 'after',
  streams: [
    {
      level: 'info',
      stream: process.stdout
    },
    {
      level: 'error',
      path: '/var/tmp/myapp-error.log'
    }
  ]
});

// Logger = function () { };

// Logger.prototype = {
//   getSystemLogger: function () {
//     return log;
//   }
// };

module.exports = log;