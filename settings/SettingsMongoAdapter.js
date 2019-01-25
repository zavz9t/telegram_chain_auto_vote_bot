'use strict';

const { Collection } = require(`mongodb`)
;

class SettingsMongoAdapter {

    /**
     * @param {Collection} conn Mongo Collection where need to store data
     * @param {string} appId Unique identifier of current application
     */
    constructor(conn, appId) {
        this.conn = conn;
        this.appId = appId.toString();
    }

    async get(userId) {
        const thisInstance = this;

        return thisInstance.conn.find({ appId: thisInstance.appId, userId: userId })
            .toArray()
            .then((docs) => {

                if (0 === docs.length) {
                    return {};
                } else if (docs.length > 1) {
                    // TODO: add some warning
                }

                return docs[0];
            })
        ;
    }


    async set(value) {
        return;
    }
}

module.exports = SettingsMongoAdapter;
