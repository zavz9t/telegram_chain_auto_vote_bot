'use strict';

const { Db } = require(`mongodb`)
    , hash = require(`hash.js`)
    , instances = {}
;

// private methods names
const _connect = Symbol(`connect`)
;

class SettingsMongoAdapter {

    /**
     * @param {Db} conn Connection to Mongo Database
     */
    constructor(conn) {
        this.conn = conn;
    }

    async get() {
        return this[_connect]().then((client, smt) => {

            console.log(smt);

            const db = client.db();

            console.log(db);

            const collection = db.collection(`user`);
            // Find some documents
            collection.find({}).toArray(function(err, docs) {
                console.log("Get the following errors");
                console.log(err);
                console.log("Found the following records");
                console.log(docs);
            });

            client.close();

            return { some: `data` };
        });
    }


    async set(value) {
        return;
    }
}

module.exports = SettingsMongoAdapter;
