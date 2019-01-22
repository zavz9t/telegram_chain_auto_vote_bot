'use strict';

const AbstractCommand = require(`./AbstractCommand`)
    , BotHelper = require(`../bot/BotHelper`)
    , messages = require(`../messages`)
;

module.exports = class HelpCommand extends AbstractCommand {

    /**
     * @inheritDoc
     */
    static getName() {
        return `help`;
    }

    /**
     * @inheritDoc
     */
    static getAliases() {
        return [`info`];
    }

    /**
     * @inheritDoc
     */
    static run(params, channel) {
        BotHelper.processMessageSend(
            channel
            , messages.info
            , `Failed to send "/help" message to user.`
        );
    }

};
