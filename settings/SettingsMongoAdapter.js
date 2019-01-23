'use strict';

const sprintf = require(`sprintf-js`).sprintf
    , { MongoClient } = require('mongodb')
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
        this.key = `config.json`;
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
