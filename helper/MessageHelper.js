'use strict';

const { sprintf } = require(`sprintf-js`)
    , messages = require(`../messages`)
;

class MessageHelper {

    /**
     * @param {{ admin: string }} options
     *
     * @return {string}
     */
    static formatSystemError(options) {
        return sprintf(messages.systemError, options.admin);
    }

    /**
     * @param {{ command: string }} options
     *
     * @return {string}
     */
    static formatAccessDenied(options) {
        return sprintf(messages.accessDenied, options.command);
    }

    /**
     * @param {{ command: string }} options
     *
     * @return {string}
     */
    static formatUnsupportedCommand(options) {
        return sprintf(
            messages.unsupportedCommand
            , options.command
        );
    }

    /**
     * @param {Object} options
     *
     * @return {string}
     */
    static formatInfo(options = {}) {
        return messages.info;
    }

    /**
     * @param {{ command: string }} options
     *
     * @return {string}
     */
    static formatConfigInfo(options) {
        // TODO : print list of available config params and current value of it
        return sprintf(messages.configInfo, options.command);
    }

    /**
     * @param {{ param: string, value: string }} options
     *
     * @return {string}
     */
    static formatConfigParamValue(options) {
        return sprintf(
            messages.configParamValue
            , options.param
            , options.value
        );
    }

    /**
     * @param {{ param: string, value: string }} options
     *
     * @return {string}
     */
    static formatConfigParamValueChanged(options) {
        return sprintf(
            messages.configParamValueChanged
            , options.param
            , options.value
        );
    }

    /**
     * @param {{ param: string, error: string }} options
     *
     * @return {string}
     */
    static formatConfigParamValueError(options) {
        return sprintf(
            messages.configParamValueError
            , options.param
            , options.error
        );
    }

    /**
     * @param {{ settings: Object }} options
     *
     * @return {string}
     */
    static formatUserSettingsInfo(options) {
        const settingsLines = [];
        for (let paramName in options.settings) {
            settingsLines.push(sprintf(
                messages.userSettingsInfoLine
                , paramName
                , options.settings[paramName]
            ));
        }

        return sprintf(messages.userSettingsInfo, settingsLines.join(`\n`));
    }
}

module.exports = MessageHelper;
