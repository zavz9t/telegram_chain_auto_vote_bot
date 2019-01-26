'use strict';

let sprintf = require(`sprintf-js`).sprintf
    , moment = require(`moment`)
;

class Tool {
    static buildRedisKey(username) { // TODO : remove it?
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

    /**
     * Checks whether given value is empty or not
     * @param {*} value
     *
     * @return {boolean}
     */
    static isEmpty(value) {
        if (null === value) {
            return true;
        }
        switch (typeof value) {
            case `object`:
                return 0 === Object.keys(value).length;
            // case `array`:
            //     return 0 === value.length;
            default:
                return false === Boolean(value);
        }
    }
}

module.exports = Tool;
