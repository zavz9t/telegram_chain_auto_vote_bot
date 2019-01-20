'use strict';

const sprintf = require(`sprintf-js`).sprintf
    , Redis = require('ioredis')
    , hash = require(`hash.js`)
    , instances = {}
;

// private methods names
const _connect = Symbol(`connect`)
;

module.exports = class ConfigRedisAdapter {

    /**
     * @param {string} redisUrl
     */
    constructor(redisUrl) {
        this.connUrl = redisUrl;
        this.key = `config.json`;
        this.conn = null;
    }

    /**
     * @param {string} redisUrl
     *
     * @return {ConfigRedisAdapter}
     */
    static instance(redisUrl) {
        const urlHash = hash.sha256().update(redisUrl).digest(`hex`);

        if (false === (urlHash in instances)) {
            instances[urlHash] = new ConfigRedisAdapter(redisUrl);
        }
        return instances[urlHash];
    }


    async get() {
        return {};
    }


    async set(value) {
        return;
    }

    // private methods

    [_connect]() {
        if (this.conn) {
            return;
        }
        this.conn = new Redis(this.connUrl);
    }
};
