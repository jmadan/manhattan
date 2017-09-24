let Logger = require('bunyan');

let log = new Logger({
  name: 'Manhattan',
  event: 'after'
});

Logger = function () { };

Logger.prototype = {
  getSystemLogger: function () {
    return log;
  }
};

module.exports = Logger;
