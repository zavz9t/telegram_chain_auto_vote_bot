'use strict';

module.exports = class AbstractChannel {

    /**
     * Retrieves ID of author of message in channel
     * @returns {string}
     */
    getAuthorId() {
        throw new Error(`Need to implement in subclasses.`);
    }

    /**
     * Sends given text to current channel
     * @param {string} text
     *
     * @return {Promise}
     */
    async sendMessage(text) {
        throw new Error(`Need to implement in subclasses.`);
    }

};
