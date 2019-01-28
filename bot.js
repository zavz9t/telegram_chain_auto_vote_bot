'use strict';

const TelegramBot = require(`node-telegram-bot-api`)
    , Sentry = require(`@sentry/node`)
    , { ChainAdapter, ChainConstant } = require(`chain-tools-js`)
    , RedisAdapter = require(`./lib/RedisAdapter`)
    , MongoAdapter = require(`./lib/MongoAdapter`)
    , { ConfigParam, ConfigProvider } = require(`./config/index`)
    , { SettingsParam, SettingsProvider } = require(`./settings/index`)
    , CommandHandler = require(`./command/CommandHandler`)
    , TelegramChannel = require(`./bot/TelegramChannel`)
;

// TODO : add some validation for ENV variables

Promise.all([
    RedisAdapter.init(process.env.REDIS_URL)
    , MongoAdapter.init(process.env.MONGODB_URI)
]).then(() => {
    return Promise.all([
        ConfigProvider.init({ redis: RedisAdapter.getConnection() })
        , SettingsProvider.init({
            mongo: MongoAdapter.getConnection().collection(`user`) // TODO : move it to config ???
            , appId: process.env.BOT_USERNAME
        })
    ]);
}).then(() => {
    // Initialize error tracking tool
    const sentryDsn = ConfigProvider.get(ConfigParam.SENTRY_DSN);
    if (sentryDsn) {
        Sentry.init({ dsn: sentryDsn });
    }

    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(
        ConfigProvider.get(ConfigParam.BOT_TOKEN)
        , { polling: true }
    );

    CommandHandler.register();

    // Matches any kind of text messages from user
    bot.onText(/^(.+)$/, (msg, match) => {
        const receivedText = match[1].trim()
            , channel = new TelegramChannel(bot, msg)
        ;
        if (CommandHandler.hasCommand(receivedText)) {
            CommandHandler.run(receivedText, [], channel);

            return;
        }

        let parts = receivedText.split(` `);
        const command = parts[0]
            , params = parts.splice(1)
        ;

        CommandHandler.run(command, params, channel);
    });

    // Listen for any kind of message. There are different kinds of messages.
    // bot.on(`message`, (msg) => {
    //     // send a message to the chat acknowledging receipt of their message
    //     const chatId = msg.chat.id;
    //
    //     bot.sendMessage(msg.chat.id, 'Received your message')
    //         .catch((err) => {
    //             console.log(
    //                 Tool.formatErrorMessage(sprintf(
    //                     `Failed to send message to "%s" chat.\n`
    //                     , chatId
    //                 ))
    //                 , err
    //             );
    //         })
    //     ;
    // });
}).catch(err => {

    console.error(err);
    console.error(Tool.formatErrorMessage(
        `\n\nFailed to initialize Config and/or Settings.\n\n`
    ));

    // TODO: add close Mongo and Redis connection

    process.exit(1);
});



// const sereyAdapter = ChainAdapter.factory(ChainConstant.SEREY);
// sereyAdapter.connection.api.streamOperations(function(err, operation) {
//     if (err) {
//         console.error(err);
//
//         return;
//     }
//
//     // for test purpose
//     if (operation[0] === `comment` && operation[1].parent_author === ``) {
//         PostStorage.save(operation[1].author, operation[1].permlink);
//
//         // bot.sendMessage(config.adminId, `New post\n@` + operation[1].author + `/` + operation[1].permlink);
//
//         return;
//     }
//     // test end
//
//     if (operation[0] !== `comment_options`) {
//         return;
//     }
//     if (!(`extensions` in operation[1]) || operation[1].extensions.length < 1) {
//         return;
//     }
//
//     for (let i in operation[1].extensions) {
//         let extension = operation[1].extensions[i][1];
//         if (!(`beneficiaries` in extension)) {
//             continue;
//         }
//         for (let k in extension.beneficiaries) {
//             if (
//                 extension.beneficiaries[k].account === config.supportUsername
//                 && Number(extension.beneficiaries[k].weight) > config.supportMinPercent * 100
//             ) {
//                 bot.sendMessage(config.adminId, `New comment options\n` + JSON.stringify(operation[1]));
//
//                 PostStorage.save(operation[1].author, operation[1].permlink);
//             }
//         }
//     }
// });
