'use strict';

const { sprintf } = require(`sprintf-js`)
    , messages = require(`../messages`)
;

class MessageHelper {

    /**
     * @param {{ admin: {string} }} options
     */
    static formatSystemError(options) {
        return sprintf(messages.systemError, options.admin);
    }

    /**
     * @param {{ prefix: {string}, command: {string} }} options
     */
    static formatAccessDenied(options) {
        return sprintf(
            messages.accessDenied
            , options.prefix
            , options.command
        );
    }

    /**
     * @param {{ prefix: {string}, command: {string} }} options
     */
    static formatUnsupportedCommand(options) {
        return sprintf(
            messages.unsupportedCommand
            , options.prefix
            , options.command
        );
    }

    /**
     * @param {Object} options
     */
    static formatInfo(options = {}) {
        return messages.info;
    }

    /**
     * @param {{ prefix: {string}, command: {string} }} options
     */
    static formatConfigInfo(options) {
        return sprintf(
            messages.configInfo
            , options.prefix
            , options.command
        );
    }

    /**
     * @param {{ param: {string}, value: {string} }} options
     */
    static formatConfigParamValue(options) {
        return sprintf(
            messages.configParamValue
            , options.param
            , options.value
        );
    }

    /**
     * @param {{ param: {string}, value: {string} }} options
     */
    static formatConfigParamValueChanged(options) {
        return sprintf(
            messages.configParamValueChanged
            , options.param
            , options.value
        );
    }

    /**
     * @param {{ param: {string}, error: {string} }} options
     */
    static formatConfigParamValueError(options) {
        return sprintf(
            messages.configParamValueError
            , options.param
            , options.error
        );
    }
}

module.exports = MessageHelper;
