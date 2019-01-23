'use strict';

const SettingsParam = require(`./SettingsParam`)
;

module.exports = class SettingsPostFormatter {
    /**
     * Formats received validated parameter value to working look
     * @param {string} name  Name of config parameter.
     * @param {*}      value New value for config parameter.
     *
     * @return {*} Working value of parameter.
     */
    static run(name, value) {
        switch (name) {
            default:
                return value;
        }
    }
};
