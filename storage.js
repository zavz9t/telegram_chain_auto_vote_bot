'use strict';

let Redis = require(`ioredis`)
    , config = require(`./config`)
    , Tool = require(`./tool`)
;

const redis = new Redis(config.redisUrl);

module.exports = class PostStorage {
    static save(author, permlink) {
        redis.sadd(Tool.buildRedisKey(author), permlink);
    }
};