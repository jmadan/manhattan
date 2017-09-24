const redis = require('redis');
const url = require('url');

var redisURL = url.parse(process.env.REDISCLOUD);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

client.on('connect', function() {
    console.log('connected');
});


function setRedis(key, val) {
    client.set(key, val);
}

function getRedis(key) {
    return new Promise((resolve, reject) => {
        client.get(key, (err, reply) => {
            if(err) {
                reject(err);
            }
            resolve(reply);
        });
    });
}

function checkRedis (key) {
    return new Promise((resolve, reject) => {
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
    })
}


module.exports = {
    setRedis: setRedis,
    getRedis: getRedis,
    checkRedis: checkRedis
}