const redisUtil = require('async-redis');
const config = require('config');
const client = redisUtil.createClient(config.get('redis.port'), config.get('redis.host'));
client.on('connect', function () {
    console.log('Redis client connected');
}).on('error', function (err) {
    console.log('Something went wrong ' + err);
});

module.exports = {
    async setKey(key, value) {
        try {
            await client.set(key, value);
        } catch (e) {
            console.error(e);
        }
    },
    async getKey(key) {
        let value;
        try {
            value = await client.get(key);
        } catch (e) {
            console.error(e);
        }
        return value;
    }
}
