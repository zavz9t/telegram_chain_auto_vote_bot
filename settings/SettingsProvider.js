'use strict';

const Tool = require(`../Tool`)
    , SettingsParam = require(`./SettingsParam`)
    , SettingsMongoAdapter = require(`./SettingsMongoAdapter`)
    , ConfigProvider = require(`../config/ConfigProvider`)
;

let runtimeConfig = {}
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
     * @param {{ mongo: string }} options
     *                          - mongo - specifies connection URL to MongoDB instance
     * @return Promise<void>
     */
    static async init(options = {}) {
        if (initialized) {
            // TODO: add warning? error?
            return;
        }
        mongoAdapter = SettingsMongoAdapter.instance(options.mongo);

        return mongoAdapter.checkConnection().then(() => {
            initialized = true;
        });
    }

    /**
     * Totally resets all config data
     */
    static reset() {
        runtimeConfig = {};
        fileAdapter = null;
        redisAdapter = null;
        configInitialized = false;
    }

    /**
     * Returns current value of config parameter
     * @param {string} name Name of config parameter.
     *
     * @return {*|null} Value of config parameter or null if parameter doesn't exists.
     */
    static get(name) {
        SettingsProvider[_checkInit]();

        if (name in runtimeConfig) {
            return this[_processEnvVariable](runtimeConfig[name]);
        } else {
            return null;
        }
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
