'use strict';

const { MongoClient } = require('mongodb')
    , hash = require(`hash.js`)
    , instances = {}
;

// private methods names
const _connect = Symbol(`connect`)
;

module.exports = class SettingsMongoAdapter {

    /**
     * @param {string} url
     */
    constructor(url) {
        this.connUrl = url;
        this.conn = null;
    }

    /**
     * @param {string} url
     *
     * @return {SettingsMongoAdapter}
     */
    static instance(url) {
        const urlHash = hash.sha256().update(url).digest(`hex`);

        if (false === (url in instances)) {
            instances[urlHash] = new SettingsMongoAdapter(url);
        }
        return instances[urlHash];
    }

    /**
     * @return {Promise<void>}
     */
    async checkConnection() {
        return this[_connect]().then(() => { });
    }

    async get() {
        return {};
    }


    async set(value) {
        return;
    }

    // private methods

    /**
     * @return {Promise<MongoClient>}
     */
    [_connect]() {
        return MongoClient.connect(this.connUrl);
    }
};
