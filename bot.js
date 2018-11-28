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
    if (err) {
        console.error(err);

        return;
    }

    // if (operation[0] === `comment`) {
    //     bot.sendMessage(config.adminId, `2: New comment\n` + JSON.stringify(operation[1]));
    // }
    if (operation[0] !== `comment_options`) {
        return;
    }
    if (!(`extensions` in operation[1]) || operation[1].extensions.length < 1) {
        return;
    }

    for (let i in operation[1].extensions) {
        let extension = operation[1].extensions[i][1];
        if (!(`beneficiaries` in extension)) {
            continue;
        }
        for (let k in extension.beneficiaries) {
            if (extension.beneficiaries[k].account === `chain-post`) {
                bot.sendMessage(config.adminId, `New comment options\n` + JSON.stringify(operation[1]));
            }
        }
    }
});
