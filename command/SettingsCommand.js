'use strict';

const { sprintf } = require(`sprintf-js`)
    , AbstractCommand = require(`./AbstractCommand`)
    , { ConfigProvider, ConfigParam } = require(`../config/index`)
    , { SettingsProvider } = require(`../settings/index`)
    // , ConfigValidator = require(`../config/ConfigValidator`)
    // , ConfigPreFormatter = require(`../config/ConfigPreFormatter`)
    // , ConfigPostFormatter = require(`../config/ConfigPostFormatter`)
    , BotHelper = require(`../bot/BotHelper`)
    , MessageHelper = require(`../helper/MessageHelper`)
;

// private methods
const _parseParams = Symbol(`parseParams`)
    , _infoMessageCase = Symbol(`infoMessageCase`)
;

class SettingsCommand extends AbstractCommand {

    /**
     * @inheritDoc
     */
    static getName() {
        return `/settings`;
    }

    /**
     * @inheritDoc
     */
    static run(params, channel) {
        this[_infoMessageCase](params, channel.getAuthorId())
            .then((userMessage) => {
                if (userMessage) {
                    BotHelper.processMessageSend(
                        channel
                        , userMessage
                        , `Failed to send result message of "settings" command to user.`
                    );
                }
            });
        // if (null === userMessage) {
        //     userMessage = this.retrieveParameterValueCase(params);
        // }
        // if (null === userMessage) {
        //     userMessage = this.performValidation(params);
        // }
        // if (userMessage) {
        //     BotHelper.processMessageSend(
        //         channel
        //         , userMessage
        //         , `Failed to send result message of "settings" command to user.`
        //     );
        // } else {
        //     this.changeParamValueCase(params)
        //         .then((changedMessage) => {
        //             BotHelper.processMessageSend(
        //                 channel
        //                 , changedMessage
        //                 , `Failed to send result message of "config" command to user.`
        //             );
        //         })
        //         .catch((err) => {
        //             throw err; // It will be catch at CommandHandler
        //         })
        //     ;
        // }
    }

    // private

    /**
     * @param {string[]} params
     * @param {string} userId Identifier of current user
     *
     * @return {Promise<string|null>} List of user current settings, or null - another case
     */
    static async [_infoMessageCase](params, userId) {
        if (params.length === 0) {
            const userSettings = await SettingsProvider.get(
                    userId
                    , null
                    , ConfigProvider.getUserLevelItems()
                )
                , internalParams = SettingsProvider.getInternalParamNames()
            ;
            const filteredSettings = Object.keys(userSettings)
                .filter(key => false === internalParams.includes(key))
                .reduce((obj, key) => {
                    obj[key] = userSettings[key];

                    return obj;
                }, {});

            return MessageHelper.formatUserSettingsInfo({
                settings: filteredSettings
            });
        } else {
            return null;
        }
    }

    /**
     * @param {string[]} params
     *
     * @return {string|null} Current config param value message,
     *                          or null - another case
     */
    static retrieveParameterValueCase(params) {
        if (params.length === 1) {
            return MessageHelper.formatConfigParamValue({
                param: params[0]
                , value: JSON.stringify(ConfigProvider.get(params[0]))
            });
        } else {
            return null;
        }
    }

    /**
     * @param {string[]} params
     *
     * @return {string|null} Validation fail message, or null - validation success
     */
    static performValidation(params) {
        const { paramName, paramValue } = this[_parseParams](params);

        let errors = [];
        if (null === paramValue) {
            errors = [sprintf(`Config parameter "%s" cannot be changed.`, paramName)];
        } else {
            errors = ConfigValidator.validate(paramName, paramValue);
        }

        if (errors.length) {
            return MessageHelper.formatConfigParamValueError({
                param: paramName
                , error: JSON.stringify(errors)
            });
        } else {
            return null;
        }
    }

    /**
     * @param {string[]} params
     *
     * @return {Promise<string>} Config Parameter was changed message
     */
    static async changeParamValueCase(params) {
        const { paramName, paramValue } = this[_parseParams](params);

        return ConfigProvider.set(
            paramName
            , ConfigPostFormatter.run(paramName, paramValue)
        ).then(() => {
            return MessageHelper.formatConfigParamValueChanged({
                param: paramName
                , value: JSON.stringify(ConfigProvider.get(paramName))
            });
        });
    }

    /**
     * Parses input parameters and retrieves result of it
     * @param {Array} params
     * @return {{ paramName: string, paramValue: * }}
     */
    static [_parseParams](params) {
        let paramsCopy = [...params];
        return {
            paramName: paramsCopy[0]
            , paramValue: ConfigPreFormatter.run(
                paramsCopy[0]
                , paramsCopy.splice(1)
            )
        }
    }
}

module.exports = SettingsCommand;
