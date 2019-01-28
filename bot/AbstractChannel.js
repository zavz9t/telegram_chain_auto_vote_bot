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
     * @param {Object} options
     *
     * @return {Promise}
     */
    async sendMessage(text, options = {}) {
        throw new Error(`Need to implement in subclasses.`);
    }

};
