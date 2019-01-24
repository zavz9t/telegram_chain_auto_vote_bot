'use strict';

const Tool = require(`../Tool`)
    , FileAdapter = require(`./ConfigFileAdapter`)
    , RedisAdapter = require(`./ConfigRedisAdapter`)
;

let runtimeConfig = {}
    , redisAdapter = null
    , fileAdapter = null
    , configFilesPath = null
    , configInitialized = false
;

const envVariablePrefix = `$`;

// private methods names
const _checkInit = Symbol(`checkInit`)
    , _load = Symbol(`load`)
    , _processEnvVariable = Symbol(`processEnvVariable`)
    , _dump = Symbol(`dump`)
    , _dumpToFile = Symbol(`dumpToFile`)
    , _dumpToRedis = Symbol(`dumpToRedis`)
;

module.exports = class ConfigProvider {

    /**
     * @param {{ path: (string|undefined), redis: (string|undefined) }} options Available options
     *                          - path - specifies path where need to look config files
     *                          - redis - specifies connection URL to Redis instance (stores system config updates)
     * @return Promise<void>
     */
    static async init(options = {}) {
        if (configInitialized) {
            // TODO: add warning? error?
            return;
        }

        if (`path` in options) {
            configFilesPath = options.path;
        } else if (`NODE_PATH` in process.env) {
            configFilesPath = process.env.NODE_PATH;
        } else if (`PWD` in process.env) {
            configFilesPath = process.env.PWD;
        } else {
            throw Error(Tool.formatErrorMessage(
                `Failed to determine working config directory.`
                    + ` Please specify "path" init option.`
            ));
        }
        fileAdapter = FileAdapter.instance(configFilesPath);

        if (`redis` in options) {
            redisAdapter = new RedisAdapter(options.redis);
        }

        return this[_load]().then(() => {
            configInitialized = true;
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
        ConfigProvider[_checkInit]();

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
        if (false === configInitialized) {
            throw new Error(Tool.formatErrorMessage(
                `Config was not initialized. Do it before usage.`
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
     * Checks whether param is ENV key and process such case
     * @param {*} paramValue
     * @return {*} ENV value, or given value if there isn't such ENV key
     */
    static [_processEnvVariable](paramValue) {
        if (
            false === Boolean(paramValue)
            || `string` !== typeof paramValue
            || envVariablePrefix !== paramValue[0]
        ) {
            return paramValue;
        }
        const paramEnvKey = paramValue.substr(1);
        if (paramEnvKey in process.env) {
            return process.env[paramEnvKey];
        } else {
            return paramValue;
        }
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
