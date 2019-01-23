'use strict';

const Validator = require(`better-validator`)
    , SettingsParam = require(`./SettingsParam`)
;

module.exports = class SettingsValidator {

    /**
     * Validates received parameter name and value
     * @param {string} name  Name of parameter.
     * @param {*}      value New value for parameter.
     *
     * @return {Array} List of errors, empty if all fine.
     */
    static validate(name, value) {
        switch (name) {
            case SettingsParam.WEIGHT:
                return this.validateWeight(value);
            case SettingsParam.MIN_VP:
                return this.validateMinVp(value);
            default:
                return [];
        }
    }

    /**
     * Validates "weight" config parameter
     * @param {*} value New value for config parameter.
     *
     * @return {Array} List of errors, empty if all fine.
     */
    static validateWeight(value) {
        const validator = new Validator();

        validator(value).isNumber().isInRange(0.01, 100);

        return validator.run();
    }

    /**
     * Validates "minVp" config parameter
     * @param {*} value New value for config parameter.
     *
     * @return {Array} List of errors, empty if all fine.
     */
    static validateMinVp(value) {
        const validator = new Validator();

        validator(value).isNumber().integer().isInRange(1, 99);

        return validator.run();
    }
};
