'use strict';

/**
 * Contains list of available config parameters
 * @property {string} BOT_TOKEN Token to receive access to the bot
 * @property {string} SENTRY_DSN Access data to connect Sentry error tracker
 * @property {string} ADMIN_ID
 * @property {string} ADMIN_NAME Display name of administrator
 * @property {string} WEIGHT Weight of vote
 * @property {string} MIN_VP Minimum value of VP when bot will perform vote.
 */
class ConfigParam {}

ConfigParam.BOT_TOKEN = `botToken`;
ConfigParam.SENTRY_DSN = `sentryDsn`;
ConfigParam.ADMIN_ID = `adminId`;
ConfigParam.ADMIN_NAME = `adminName`;
ConfigParam.WEIGHT = `weight`;
ConfigParam.MIN_VP = `minVp`;

module.exports = ConfigParam;
