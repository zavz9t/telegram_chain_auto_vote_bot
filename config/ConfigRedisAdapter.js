'use strict';

const { sprintf } = require(`sprintf-js`)
    , Redis = require('ioredis')
    , Tool = require(`../Tool`)
;

module.exports = class ConfigRedisAdapter {

    /**
     * @param {Redis} redis Connection to Redis instance
     */
    constructor(redis) {
        this.conn = redis;
        this.key = `config.json`;
    }

    /**
     * Retrieves config Object from Redis instance
     * @return {Promise<Object>}
     */
    async get() {
        const thisInstance = this;

        return thisInstance.conn
            .get(thisInstance.key)
            .then((result) => {
                if (false === Boolean(result)) {
                    return {};
                }
                try {
                    return JSON.parse(result);
                } catch (err) {
                    console.error(
                        Tool.formatErrorMessage(sprintf(
                            `Failed to parse JSON data from Redis by key "%s".`
                            , thisInstance.key
                        ))
                        , err
                    );

                    return {};
                }
            })
        ;
    }

    /**
     * Sets new config values to Redis instance
     * @param {Object} value
     *
     * @return {Promise<void>}
     */
    async set(value) {
        const thisInstance = this;

        return thisInstance.conn.set(thisInstance.key, JSON.stringify(value));
    }
};
