'use strict';

const { sprintf } = require(`sprintf-js`)
    , AbstractCommand = require(`./AbstractCommand`)
    , Tool = require(`../Tool`)
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
        channel.sendMessage(messages.info)
            .catch((err) => {
                Tool.handleUnsupportedError(
                    err
                    , `Failed to send "/help" message to user.`
                );
            })
        ;
    }

};
