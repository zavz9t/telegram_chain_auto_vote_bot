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

    /**
     * Formats options for message to display menu
     * @param {Array} buttons
     *
     * @return {{reply_markup: string}}
     */
    static formatMessageMenuOptions(buttons) {
        return {
            reply_markup: JSON.stringify({
                keyboard: buttons
                , resize_keyboard: true
            })
        };
    }

}

module.exports = BotHelper;
