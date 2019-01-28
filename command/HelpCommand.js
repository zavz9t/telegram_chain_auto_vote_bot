'use strict';

const AbstractCommand = require(`./AbstractCommand`)
    , BotHelper = require(`../bot/BotHelper`)
    , MessageHelper = require(`../helper/MessageHelper`)
;

module.exports = class HelpCommand extends AbstractCommand {
    /**
     * @inheritDoc
     */
    static getName() {
        return `/help`;
    }

    /**
     * @inheritDoc
     */
    static getAliases() {
        return [`/info`, `/start`];
    }

    /**
     * @inheritDoc
     */
    static run(params, channel) {
        BotHelper.processMessageSend(
            channel
            , MessageHelper.formatInfo()
            , `Failed to send "/help" message to user.`
        );
    }
};
