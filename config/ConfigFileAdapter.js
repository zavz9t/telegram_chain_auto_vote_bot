'use strict';

const { sprintf } = require(`sprintf-js`)
    , fs = require(`fs`)
    , fsPromises = fs.promises
    , hash = require(`hash.js`)
    , Tool = require(`../Tool`)
    , instances = {}
;

// private methods names
const _getRuntimeFilePath = Symbol(`getRuntimeFilePath`)
    , _getDistFilePath = Symbol(`getDistFilePath`)
;

module.exports = class ConfigFileAdapter {

    /**
     * @param {string} dir
     *
     * @throws Error If given directory is not readable and/or writable
     */
    constructor(dir) {
        this.dir = dir;
        this.runtimeFile = `config.json`;
        this.distFile = `config.json.dist`;
        this.encoding = `utf8`;

        try {
            fs.accessSync(this.dir, fs.constants.R_OK | fs.constants.W_OK);
        } catch (err) {
            const errMessage = sprintf(
                `Have no access for reading/writing in working config directory "%s".`
                + ` Please specify/change "path" init option.`
                , this.dir
            );
            throw Error(Tool.formatErrorMessage(errMessage));
        }
    }

    /**
     * @param {string} dir
     *
     * @return {ConfigFileAdapter}
     */
    static instance(dir) {
        const dirHash = hash.sha256().update(dir).digest(`hex`);

        if (false === (dirHash in instances)) {
            instances[dirHash] = new ConfigFileAdapter(dir);
        }
        return instances[dirHash];
    }

    /**
     * Returns current config values
     * @return {Promise<Object>}
     */
    async get() {
        const classInstance = this;
        let configData = {};

        return fsPromises.readFile(
            classInstance[_getDistFilePath]()
            , classInstance.encoding
        ).then((fileContent) => {
            configData = JSON.parse(fileContent);
        }).then(() => {
            const runtimeFilePath = classInstance[_getRuntimeFilePath]();
            if (false === fs.existsSync(runtimeFilePath)) {
                return configData;
            }
            try {
                const runtimeData = JSON.parse(
                    fs.readFileSync(runtimeFilePath, classInstance.encoding)
                );
                configData = Object.assign(configData, runtimeData);
            } catch (err) {
                const errorMessage = sprintf(
                    `Failed to parse "runtime" config file "%s".\n`
                    , runtimeFilePath
                );
                console.error(Tool.formatErrorMessage(errorMessage), err);
            }

            return configData;
        });
    }

    /**
     * Stores given config data to "runtime" file
     * @param {Object} value
     *
     * @return {Promise<void>}
     */
    async set(value) {
        return fsPromises.writeFile(
            this[_getRuntimeFilePath]()
            , JSON.stringify(value)
        );
    }

    // private methods

    /**
     * @return {string}
     */
    [_getRuntimeFilePath]() {
        return sprintf(`%s/%s`, this.dir, this.runtimeFile);
    }

    /**
     * @return {string}
     */
    [_getDistFilePath]() {
        return sprintf(`%s/%s`, this.dir, this.distFile);
    }
};
