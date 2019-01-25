'use strict';

let sprintf = require(`sprintf-js`).sprintf
    , moment = require(`moment`)
;

module.exports = class Tool {
    static buildRedisKey(username) {
        return sprintf(
            `%s_%s`,
            moment().format(`YYYY-MM-DD`),
            username
        );
    }

    /**
     * Formats error message with more system details
     * @param {string} message
     *
     * @return {string}
     */
    static formatErrorMessage(message) {
        return sprintf(
            `%s: %s`
            , (new Date()).toUTCString()
            , message
        );
    }

    /**
     * Handles errors which was not supported at system workflow
     * @param {Error} err
     * @param {string} message
     */
    static handleUnsupportedError(err, message) {
        console.error(this.formatErrorMessage(message) + `\n`, err);
    }

    /**
     * Performs coping of Object and merge it with all next provided Objects
     * @param {Object} sourceObj
     * @param {...Object} objects
     *
     * @return {Object}
     */
    static jsonCopy(sourceObj, ...objects) {
        let destObj = JSON.parse(JSON.stringify(sourceObj));

        destObj = Object.assign(destObj, ...objects);

        return destObj;
    }
};