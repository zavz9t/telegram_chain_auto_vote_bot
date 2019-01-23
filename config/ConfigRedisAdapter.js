'use strict';

const { sprintf } = require(`sprintf-js`)
    , Redis = require('ioredis')
    , hash = require(`hash.js`)
    , Tool = require(`../Tool`)
    , instances = {}
;

// private methods names
const _getConn = Symbol(`getConn`)
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

    /**
     * Retrieves config Object from Redis instance
     * @return {Promise<Object>}
     */
    async get() {
        const thisInstance = this;
        return this[_getConn]().get(thisInstance.key).then((result) => {
            if (false === Boolean(result)) {
                return {};
            }
            try {
                return JSON.parse(result);
            } catch (err) {
                console.error(
                    Tool.formatErrorMessage(sprintf(
                        `Failed to parse JSON data from Redis by key "%s" at "%s" instance.`
                        , thisInstance.key
                        , thisInstance.connUrl
                    ))
                    , err
                );

                return {};
            }
        });
    }

    /**
     * Sets new config values to Redis instance
     * @param {Object} value
     * @return {Promise<void>}
     */
    async set(value) {
        const thisInstance = this;

        return this[_getConn]().set(thisInstance.key, JSON.stringify(value));
    }

    // private methods

    /**
     * Connects to Redis instance and returns connection to it
     * @return {Redis}
     */
    [_getConn]() {
        if (null === this.conn) {
            this.conn = new Redis(this.connUrl);
        }
        return this.conn;
    }
};
