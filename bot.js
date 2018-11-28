'use strict';

const TelegramBot = require(`node-telegram-bot-api`)
    , steem = require(`@steemit/steem-js`)
    , config = require(`./config`)
;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.botToken, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on(`message`, (msg) => {
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(msg.chat.id, 'Received your message');
});


steem.api.setOptions({ url: config.socket });
steem.config.set(`address_prefix`, config.addressPrefix);
steem.config.set(`chain_id`, config.chainId);


steem.api.streamOperations(`head`, function(err, operation) {
    if (operation[0] !== `comment`) {
        return;
    }

    bot.sendMessage(config.adminIdd, `New comment` + JSON.stringify(operation[1]));
});
