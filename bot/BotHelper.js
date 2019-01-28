'use strict';

const Tool = require(`../Tool`)
    , AbstractChannel = require(`./AbstractChannel`)
;

class BotHelper {

    /**
     * @param {AbstractChannel} channel
     * @param {string} message
     * @param {string} failMessage
     * @param {Object} messageOptions
     */
    static processMessageSend(
        channel
        , message
        , failMessage
        , messageOptions = {}
    ) {
        channel.sendMessage(message, messageOptions)
            .catch((err) => {
                Tool.handleUnsupportedError(err, failMessage);
            })
        ;
    }

}

module.exports = BotHelper;
