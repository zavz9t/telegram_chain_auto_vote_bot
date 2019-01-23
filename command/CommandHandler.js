'use strict';

const EventEmitter = require(`eventemitter3`)
    , AccessDeniedError = require(`../error/AccessDeniedError`)
    , AbstractChannel = require(`../bot/AbstractChannel`)
    , { ConfigParam, ConfigProvider } = require(`../config/index`)
    , BotHelper = require(`../bot/BotHelper`)
    , MessageHelper = require(`../helper/MessageHelper`)
    , HelpCommand = require(`./HelpCommand`)
    , ConfigCommand = require(`./ConfigCommand`)
;

const commandEmitter = new EventEmitter();

module.exports = class CommandHandler {
    /**
     * Registers available commands
     */
    static register() {
        commandEmitter.removeAllListeners();

        const commands = [
            HelpCommand
            , ConfigCommand
        ];
        commands.forEach((command) => {
            command.register(commandEmitter);
        });
    }

    /**
     * @param {string}          commandName
     * @param {Array}           params
     * @param {AbstractChannel} channel
     */
    static run(commandName, params, channel) {
        if (0 === commandEmitter.listenerCount(commandName)) {
            BotHelper.processMessageSend(
                channel
                , MessageHelper.formatUnsupportedCommand({
                    prefix: ConfigProvider.get(ConfigParam.COMMAND_PREFIX)
                    , command: commandName
                })
                , `Failed to send "unsupportedCommand" message to user.`
            );

            return;
        }
        try {
            commandEmitter.emit(commandName, params, channel);
        } catch (err) {
            if (err instanceof AccessDeniedError) {
                BotHelper.processMessageSend(
                    channel
                    , MessageHelper.formatAccessDenied({
                        prefix: ConfigProvider.get(ConfigParam.COMMAND_PREFIX)
                        , command: commandName
                    })
                    , `Failed to send "accessDenied" message to user.`
                );

                return;
            }

            console.error(err);

            BotHelper.processMessageSend(
                channel
                , MessageHelper.formatSystemError({
                    admin: channel.formatUserMention(
                        ConfigProvider.get(ConfigParam.ADMIN_ID)
                        , ConfigProvider.get(ConfigParam.ADMIN_NAME)
                    )
                })
                , `Failed to send "systemError" message to user.`
            );
        }
    }
};
