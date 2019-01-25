'use strict';

const { Collection } = require(`mongodb`)
    , { sprintf } = require(`sprintf-js`)
    , Validator = require(`better-validator`)
    , Tool = require(`../Tool`)
    , SettingsParam = require(`./SettingsParam`)
    , SettingsMongoAdapter = require(`./SettingsMongoAdapter`)
;

let runtimeUserId = null
    , runtimeUserSettings = {}
    , mongoAdapter = null
    , initialized = false
;

// private methods names
const _checkInit = Symbol(`checkInit`)
    , _validateInitOptions = Symbol(`validateInitOptions`)
    , _buildGetResult = Symbol(`buildGetResult`)
;

module.exports = class SettingsProvider {

    /**
     * @param {{ mongo: Collection, appId: string }} options
     *                          - mongo - specifies MongoDB collection to store data
     *                          - appId - specifies unique identifier of current application
     * @return Promise<void>
     */
    static async init(options = {}) {
        if (initialized) {
            // TODO: add warning? error?
            return;
        }
        const errors = this[_validateInitOptions](options);
        if (errors.length) {
            throw new Error(sprintf(
                `Init options of "SettingsProvider" not valid. Errors: %s`
                , JSON.stringify(errors)
            ));
        }

        mongoAdapter = new SettingsMongoAdapter(options.mongo, options.appId);

        initialized = true;
    }

    /**
     * Totally resets all config data
     */
    static reset() {
        initialized = false;
        mongoAdapter = null;
        runtimeUserId = null;
        runtimeUserSettings = {};
    }

    /**
     * Returns current value for parameter of user
     * @param {string} userId Identifier of user
     * @param {string|null} name Name of parameter
     * @param {*|null} defaultValue Default value if we don't find data
     *
     * @return {Promise<*>} Value of parameter or list all user parameters if it name was not specified
     */
    static async get(userId, name = null, defaultValue = null) {
        this[_checkInit]();

        const userIdString = userId.toString();

        if (userIdString === runtimeUserId) {
            return this[_buildGetResult](name, defaultValue);
        }
        const thisClass = this;

        return mongoAdapter.get(userIdString).then((data) => {
            runtimeUserId = userIdString;
            runtimeUserSettings = data;

            return thisClass[_buildGetResult](name, defaultValue);
        });
    }

    /**
     * Changes parameter value
     * @param {string} userId Unique identifier of user
     * @param {string} name Name of parameter
     * @param {*}      value New value for specified parameter
     *
     * @return Promise<void>
     */
    static async set(userId, name, value) {
        return this.get(userId)
            .then((userSettings) => {
                userSettings[name] = value;

                return mongoAdapter.set(userId.toString(), userSettings);
            })
        ;
    }

    // private methods

    /**
     * @param {Object} options Init options to validate
     *
     * @return {Array} List of errors. Empty is all fine
     */
    static [_validateInitOptions](options) {
        const validator = new Validator();

        validator(options).required().isObject((obj) => {
            obj(`mongo`).required().isObject();
            validator(options.mongo instanceof Collection)
                .display(`mongo instance Collection`)
                .isBoolean().isEqual(true)
            ;

            obj(`appId`).required().isString().notEmpty();
        });

        return validator.run();
    }

    /**
     * Checks whether class was initialized or not
     *
     * @throws Error If class was not initialized
     */
    static [_checkInit]() {
        if (false === initialized) {
            throw new Error(Tool.formatErrorMessage(
                `Settings was not initialized. Do it before usage.`
            ));
        }
    }

    /**
     * Builds result value for "get" method
     * @param {string|null} paramName Name of parameter which need to return or null - all params
     * @param {*} defaultValue Default value which need to return if data not found
     *
     * @return {*}
     */
    static [_buildGetResult](paramName, defaultValue) {
        if (paramName) {
            return paramName in runtimeUserSettings
                ? runtimeUserSettings[paramName]
                : defaultValue
            ;
        } else {
            return runtimeUserSettings;
        }
    }
};
