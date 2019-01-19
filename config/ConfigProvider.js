'use strict';

const sprintf = require(`sprintf-js`).sprintf
    , fs = require(`fs`)
    , ConfigNotInitializedError = require(`./ConfigNotInitializedError`)
    , ConfigInvalidArgumentError = require(`./ConfigInvalidArgumentError`)
;

let runtimeConfig = {}
    , configFilePath = null
    , configInitialized = false
    , configLoaded = false
    , runtimeConfigDir = __dirname + `/..`
;

const defaultConfigFile = `config.json`
    , defaultConfigDistFile = `config.json.dist`
    , defaultFileEncoding = `utf8`
    , envVariablePrefix = `$`
;

// private methods names
const _checkInit = Symbol(`checkInit`)
    , _load = Symbol(`load`)
    , _processEnvVariable = Symbol(`processEnvVariable`)
;

module.exports = class ConfigProvider {

    /**
     * @param {Object} options Available options
     *                          - path - specifies path where need to look config files
     */
    static init(options = {}) {
        if (configInitialized) {
            // TODO: add warning? error?
            return;
        }
        if (`path` in options) {
            if (false === fs.existsSync(options.path)) {
                throw new ConfigInvalidArgumentError(sprintf(
                    `Received "path" option value "%s" is not valid directory.`
                    , options.path
                ));
            }
            if (false === fs.existsSync(sprintf(`%s/%s`, options.path, defaultConfigDistFile))) {
                throw new ConfigInvalidArgumentError(sprintf(
                    `Given config directory "%s" doesn't contain config file "%s".`
                    , options.path
                    , defaultConfigDistFile
                ));
            }
            configFilePath = options.path;
        } else {
            configFilePath = process.env.NODE_PATH;
        }
        configInitialized = true;
    }

    /**
     * Totally resets all config data
     */
    static reset() {
        runtimeConfig = {};
        configLoaded = false;
        configInitialized = false;
    }

    /**
     * Returns current value of config parameter
     * @param {string} name Name of config parameter.
     * @return {*|null} Value of config parameter or null if parameter doesn't exists.
     */
    static get(name) {
        ConfigProvider[_checkInit]();
        ConfigProvider[_load]();

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
     */
    static set(name, value) {
        if (false === (name in runtimeConfig)) {
            return;
        }
        if (null === value || undefined === value) {
            delete runtimeConfig[name];
        } else {
            runtimeConfig[name] = value;
        }
        ConfigProvider.dump();
    }

    // private methods

    /**
     * Checks whether class was initialized or not
     *
     * @throws ConfigNotInitializedError If class was not initialized
     */
    static [_checkInit]() {
        if (false === configInitialized) {
            throw new ConfigNotInitializedError(
                `Config was not initialized. Do it before usage.`
            );
        }
    }

    /**
     * Loads config data from storage
     */
    static [_load]() {
        if (configLoaded) {
            // TODO: add warning? error?
            return;
        }
        runtimeConfig = JSON.parse(
            fs.readFileSync(
                sprintf(`%s/%s`, configFilePath, defaultConfigDistFile)
                , defaultFileEncoding
            )
        );
        const filePath = sprintf(`%s/%s`, configFilePath, defaultConfigFile);
        if (fs.existsSync(filePath)) {
            const configData = JSON.parse(
                fs.readFileSync(filePath, defaultFileEncoding)
            );
            runtimeConfig = Object.assign(runtimeConfig, configData);
        }
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
};
