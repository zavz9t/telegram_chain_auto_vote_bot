'use strict';

const TelegramBot = require(`node-telegram-bot-api`)
    , Sentry = require(`@sentry/node`)
    , chainAdapters = require(`blockchain-adapters-js`)
    , config = require(`./config`)
    , PostStorage = require(`./storage`)
;

Sentry.init({ dsn: config.sentryDsn });

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.botToken, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on(`message`, (msg) => {
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(msg.chat.id, 'Received your message');
});

const sereyAdapter = chainAdapters.ChainAdapter.factory(chainAdapters.ChainConstant.SEREY);
sereyAdapter.connection.api.streamOperations(function(err, operation) {
    if (err) {
        console.error(err);

        return;
    }

    // for test purpose
    if (operation[0] === `comment` && operation[1].parent_author === ``) {
        PostStorage.save(operation[1].author, operation[1].permlink);

        // bot.sendMessage(config.adminId, `New post\n@` + operation[1].author + `/` + operation[1].permlink);

        return;
    }
    // test end

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
            if (
                extension.beneficiaries[k].account === config.supportUsername
                && Number(extension.beneficiaries[k].weight) > config.supportMinPercent * 100
            ) {
                bot.sendMessage(config.adminId, `New comment options\n` + JSON.stringify(operation[1]));

                PostStorage.save(operation[1].author, operation[1].permlink);
            }
        }
    }
});
