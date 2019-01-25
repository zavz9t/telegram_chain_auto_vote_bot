'use strict';

const { Collection } = require(`mongodb`)
    , Tool = require(`../Tool`)
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

    /**
     * @param {string} userId Unique identifier of user
     * @param {Object} value User settings which need to store
     *
     * @return {Promise<number>} Number of updated rows
     */
    async set(userId, value) {
        if (`_id` in value) {
            return this.conn.updateOne({ _id: value[`_id`] }, { $set: value })
                .then((result) => {
                    return result.result.n;
                });
        } else {
            return this.conn.insertOne(Tool.jsonCopy(
                    value
                    , { appId: this.appId, userId: userId }
                ))
                .then((result) => {
                    return result.result.n;
                });
        }
    }
}

module.exports = SettingsMongoAdapter;
