'use strict';

const { sprintf } = require(`sprintf-js`)
    , TelegramBot = require(`node-telegram-bot-api`)
    , AbstractChannel = require(`./AbstractChannel`)
;

module.exports = class TelegramChannel extends AbstractChannel {

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
        return this.message.from.id;
    }

    /**
     * Retrieves ID of message channel
     * @returns {string}
     */
    getChatId() {
        return this.message.chat.id;
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
    async sendMessage(text) {
        return this.bot.sendMessage(
            this.getChatId()
            , text
            , { parse_mode: `Markdown` }
        );
    }

};
