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
};