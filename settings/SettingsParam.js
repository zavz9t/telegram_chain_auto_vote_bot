'use strict';

/**
 * @property {string} WEIGHT Weight of vote
 * @property {string} MIN_VP Minimum value of VP when bot will perform vote.
 * @property {string} DB_RECORD_ID Name of internal DB identifier of record
 * @property {string} APP_ID Unique identifier of current application
 * @property {string} USER_ID Unique identifier of user in communication app
 */
class SettingsParam { }

SettingsParam.WEIGHT = `weight`;
SettingsParam.MIN_VP = `minVp`;
SettingsParam.DB_RECORD_ID = `_id`;
SettingsParam.APP_ID = `appId`;
SettingsParam.USER_ID = `userId`;

module.exports = SettingsParam;
