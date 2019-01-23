'use strict';

const SettingsParam = require(`./SettingsParam`);

module.exports = class SettingsPreFormatter {
    /**
     * Formats received new parameter value to working look
     * @param {string} name    Name of parameter.
     * @param {Array}  options Array with options for new value of parameter.
     *
     * @return {*|null} Working value of parameter or null for non supported values
     */
    static run(name, options) {
        switch (name) {
            case SettingsParam.WEIGHT:
            case SettingsParam.MIN_VP:
                return Number(options[0]);
            default:
                return null;
        }
    }
};
