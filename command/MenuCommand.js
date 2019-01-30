'use strict';

const AbstractCommand = require(`./AbstractCommand`)
    , BotHelper = require(`../bot/BotHelper`)
    , MenuHelper = require(`../helper/MenuHelper`)
;

class MenuCommand extends AbstractCommand {

    /**
     * @inheritDoc
     */
    static getName() {
        return `/menu`;
    }

    /**
     * @inheritDoc
     */
    static getAliases() {
        return [MenuHelper.BUTTON_GO_BACK];
    }

    /**
     * @inheritDoc
     */
    static run(params, channel) {
        BotHelper.processMessageSend(
            channel
            , `/menu` // TODO : add here some info text
            , `Failed to send "/menu" message to user.`
            , BotHelper.formatMessageMenuOptions(MenuHelper.getMainMenuButtons())
        );
    }
}

module.exports = MenuCommand;
