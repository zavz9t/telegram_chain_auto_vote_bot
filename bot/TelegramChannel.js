'use strict';

const { sprintf } = require(`sprintf-js`)
    , TelegramBot = require(`node-telegram-bot-api`)
    , AbstractChannel = require(`./AbstractChannel`)
    , Tool = require(`../Tool`)
;

class TelegramChannel extends AbstractChannel {

    /**
     * @param {TelegramBot} bot
     * @param {Object} message
     */
    constructor(bot, message) {
        super();

        this.bot = bot;
        this.message = message;
    }

    /**
     * @inheritDoc
     */
    getAuthorId() {
        return this.message.from.id.toString();
    }

    /**
     * Retrieves ID of message channel
     * @returns {string}
     */
    getChatId() {
        return this.message.chat.id.toString();
    }

    /**
     * @param {number} userId
     * @param {string} name
     */
    formatUserMention(userId, name) {
        return sprintf(`[%s](tg://user?id=%s)`, name, userId);
    }

    /**
     * @inheritDoc
     */
    async sendMessage(text, options = {}) {
        return this.bot.sendMessage(
            this.getChatId()
            , text
            , Tool.jsonCopy({ parse_mode: `Markdown` }, options)
        );
    }

}

module.exports = TelegramChannel;
