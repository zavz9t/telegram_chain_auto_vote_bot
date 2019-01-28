'use strict';

const AbstractCommand = require(`./AbstractCommand`)
    , BotHelper = require(`../bot/BotHelper`)
    , MessageHelper = require(`../helper/MessageHelper`)
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
    static run(params, channel) {
        BotHelper.processMessageSend(
            channel
            , `d`
            , `Failed to send "/menu" message to user.`
            , {
                reply_markup: JSON.stringify({
                    keyboard: [
                        [`🛑 Stop`, `⚙️ Settings`, `🚀 Run`],
                        [`🏃 Curators`, `ℹ️ Information`, `⭐ Favorites`],
                    ]
                    , resize_keyboard: true
                })
            }
        );
    }
}

module.exports = MenuCommand;
