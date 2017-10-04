const redis = require('redis');
const url = require('url');

// var redisURL = url.parse(process.env.REDISCLOUD);
// let redisURL = url.parse('redis://rediscloud:jN2RI5Ecsn4OlY8x@redis-10483.c12.us-east-1-4.ec2.cloud.redislabs.com:10483');
let redisURL = url.parse('redis://h:p1eeb20d95a784fb9ad719c91da991614024154e473aeb6c2fd38836a30fb7f6b@ec2-34-233-181-119.compute-1.amazonaws.com:48649');
// var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
// client.auth(redisURL.auth.split(":")[1]);

// client.on('connect', function() {
//     console.log('connected');
// });

function redisConnect(){
  let client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  client.auth(redisURL.auth.split(":")[1]);
  return client;
}

function redisQuit(client) {
  client.quit();
}

function setRedis(key, val) {
  let client = redisConnect();
  client.set(key, val, redis.print);
  redisQuit(client);
}

function getRedis(key) {
    return new Promise((resolve, reject) => {
      let client = redisConnect();
        client.get(key, (err, reply) => {
            if(err) {
                reject(err);
            }
            resolve(JSON.parse(reply));
        });
        redisQuit(client);
    });
}

function delRedis(key) {
  let client = redisConnect();
  client.del(key);
  redisQuit(client);
}

function checkRedis (key) {
    return new Promise((resolve, reject) => {
      let client = redisConnect();
        client.exists(key, (err, reply) => {
            if(err){
                reject(err);
            }
            if (reply === 1) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
        redisQuit(client);
    })
}


module.exports = {
  setRedis,
  getRedis,
  delRedis,
  checkRedis
}
