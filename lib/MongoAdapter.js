'use strict';

const { MongoClient, Db } = require(`mongodb`)
;

let conn = null;

// private methods names
const _connect = Symbol(`connect`)
;

class MongoAdapter {

    /**
     * @param {string} url
     *
     * @return {Promise<void>}
     */
    static async init(url) {
        return this[_connect](url)
            .then((client) => {
                conn = client.db();
            });
    }

    /**
     * @return {Db}
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
     * @param {string} url Connection URL to the MongoDB instance
     *
     * @return {Promise<MongoClient>}
     */
    static [_connect](url) {
        return MongoClient.connect(url, { useNewUrlParser: true });
    }
}

module.exports = MongoAdapter;
