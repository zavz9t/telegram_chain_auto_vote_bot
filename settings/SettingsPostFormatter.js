'use strict';

const ConfigParam = require(`./ConfigParam`)
;

module.exports = class SettingsPostFormatter {
    /**
     * Formats received validated config parameter value to working look
     * @param {string} name  Name of config parameter.
     * @param {*}      value New value for config parameter.
     *
     * @return {*} Working value of config parameter.
     */
    static run(name, value) {
        switch (name) {
            default:
                return value;
        }
    }
};
