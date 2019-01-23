'use strict';

const ConfigParam = require(`./ConfigParam`);

module.exports = class SettingsPreFormatter {
    /**
     * Formats received new config parameter value to working look
     * @param {string} name    Name of config parameter.
     * @param {Array}  options Array with options for new value of config parameter.
     *
     * @return {*|null} Working value of config parameter or null for non supported values
     */
    static run(name, options) {
        switch (name) {
            case ConfigParam.WEIGHT:
            case ConfigParam.MIN_VP:
                return Number(options[0]);
            default:
                return null;
        }
    }
};
