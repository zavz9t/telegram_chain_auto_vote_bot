'use strict';

/**
 * Contains list of available config parameters
 * @typedef {Object} ConfigParam
 * @property {string} BOT_TOKEN Token to receive access to the bot
 * @property {string} SENTRY_DSN Access data to connect Sentry error tracker
 * @property {string} ADMIN_ID
 * @property {string} ADMIN_NAME Display name of administrator
 * @property {string} COMMAND_PREFIX Prefix symbol which indicates command
 * @property {string} WEIGHT Weight of vote
 * @property {string} MIN_VP Minimum value of VP when bot will perform vote.
 */
const ConfigParam = {}
    , parameterList = {
        botToken: `BOT_TOKEN`
        , sentryDsn: `SENTRY_DSN`
        , adminId: `ADMIN_ID`
        , adminName: `ADMIN_NAME`
        , commandPrefix: `COMMAND_PREFIX`
        , weight: `WEIGHT`
        , minVp: `MIN_VP`
    }
;

for (let propValue in parameterList) {
    Object.defineProperty(
        ConfigParam
        , parameterList[propValue]
        , {
            value: propValue
            , writable: false
            , enumerable: true
            , configurable : false
        }
    );
}

module.exports = ConfigParam;
