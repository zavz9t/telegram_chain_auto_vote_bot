'use strict';

const { sprintf } = require(`sprintf-js`)
    , Redis = require('ioredis')
;

let conn = null;

// private methods names
const _connect = Symbol(`connect`)
;

module.exports = class ConfigRedisAdapter {

    /**
     * @param {string} url Connection URL to the Redis instance
     *
     * @return {Promise<void>}
     */
    static async init(url) {
        let testConn = this[_connect](url);

        return testConn.ping().then((result) => {
            if (`PONG` === result) {
                conn = testConn;
            } else {
                throw new Error(sprintf(
                    `Failed connect to Redis instance by URL "%s".`
                    , url
                ));
            }
        });
    }

    /**
     * @return {Redis}
     */
    static getConnection() {
        if (null === conn) {
            throw new Error(
                `Adapter was not initialized.`
                + ` Use "init" method with connection URL to start use this adapter.`
            );
        }
        return conn;
    }

    // private methods

    /**
     * @param {string} url Connection URL to the Redis instance
     *
     * @return {Redis}
     */
    static [_connect](url) {
        return new Redis(url);
    }
};
