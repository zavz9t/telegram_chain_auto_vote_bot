'use strict';

const { Db } = require(`mongodb`)
    , Tool = require(`../Tool`)
    , SettingsParam = require(`./SettingsParam`)
    , SettingsMongoAdapter = require(`./SettingsMongoAdapter`)
    , ConfigProvider = require(`../config/ConfigProvider`)
;

let userId = null
    , userSettings = {}
    , mongoAdapter = null
    , initialized = false
;

// private methods names
const _checkInit = Symbol(`checkInit`)
    , _load = Symbol(`load`)
    , _processEnvVariable = Symbol(`processEnvVariable`)
    , _dump = Symbol(`dump`)
    , _dumpToFile = Symbol(`dumpToFile`)
    , _dumpToRedis = Symbol(`dumpToRedis`)
;

module.exports = class SettingsProvider {

    /**
     * @param {{ mongo: Db }} options
     *                          - mongo - specifies connection to MongoDB instance
     * @return Promise<void>
     */
    static async init(options = {}) {
        if (initialized) {
            // TODO: add warning? error?
            return;
        }
        mongoAdapter = new SettingsMongoAdapter(options.mongo);

        initialized = true;
    }

    /**
     * Totally resets all config data
     */
    static reset() {
        initialized = false;
        mongoAdapter = null;
        userId = null;
        userSettings = {};
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

        return mongoAdapter.get(userId).then((data) => {
            return data;
        });

        // if (name in runtimeConfig) {
        //     return this[_processEnvVariable](runtimeConfig[name]);
        // } else {
        //     return null;
        // }
    }

    /**
     * Changes value of config parameter
     * @param {string} name  Name of config parameter.
     * @param {*}      value New value for config parameter.
     *
     * @return Promise<void>
     */
    static async set(name, value) {
        if (false === (name in runtimeConfig)) {
            return;
        }
        runtimeConfig[name] = value;

        return this[_dump]();
    }

    // private methods

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
     * Loads config data from storage
     *
     * @return Promise<void>
     */
    static async [_load]() {
        return fileAdapter.get()
            .then((configData) => {
                runtimeConfig = configData;
            })
            .then(() => {
                if (redisAdapter) {
                    return redisAdapter.get();
                } else {
                    return {};
                }
            }).then((redisData) => {
                if (Object.keys(redisData).length) {
                    runtimeConfig = Object.assign(runtimeConfig, redisData);
                }
            })
        ;
    }

    /**
     * Stores current version of "runtime" config to configured storage
     * @return {Promise<void>}
     */
    static async [_dump]() {
        if (redisAdapter) {
            return this[_dumpToRedis]();
        } else {
            return this[_dumpToFile]();
        }
    }

    /**
     * Stores current version of config to the file
     *
     * @return {Promise<void>}
     */
    static async [_dumpToFile]() {
        return fileAdapter.set(runtimeConfig);
    }

    /**
     * Stores current version of config to Redis
     *
     * @return {Promise<void>}
     */
    static async [_dumpToRedis]() {
        return redisAdapter.set(runtimeConfig);
    }
};
