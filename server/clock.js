let CronJob = require('cron').CronJob;
let Job - require('./modules/cronjobs');

exports.newstoriesjob = new CronJob({
  cronTime: '30 * * * * *',
  onTick: Job.start(),
  start: true,
  timeZone: 'Australia/Sydney'
});
