'use strict';

const Validator = require(`better-validator`)
    , ConfigParam = require(`./ConfigParam`)
;

module.exports = class SettingsValidator {

    /**
     * Validates received config parameter name and value
     * @param {string} name  Name of config parameter.
     * @param {*}      value New value for config parameter.
     *
     * @return {Array} List of errors, empty if all fine.
     */
    static validate(name, value) {
        switch (name) {
            case ConfigParam.WEIGHT:
                return SettingsValidator.validateWeight(value);
            case ConfigParam.MIN_VP:
                return SettingsValidator.validateMinVp(value);
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
