'use strict';

const Tool = require(`../Tool`)
    , AbstractChannel = require(`./AbstractChannel`)
;

module.exports = class BotHelper {

    /**
     * @param {AbstractChannel} channel
     * @param {string} message
     * @param {string} failMessage
     */
    static processMessageSend(channel, message, failMessage) {
        channel.sendMessage(message)
            .catch((err) => {
                Tool.handleUnsupportedError(err, failMessage);
            })
        ;
    }

};
