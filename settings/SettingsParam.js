'use strict';

/**
 * Contains list of available parameters
 * @typedef {Object} SettingsParam
 * @property {string} WEIGHT Weight of vote
 * @property {string} MIN_VP Minimum value of VP when bot will perform vote.
 */
const SettingsParam = {}
    , parameterList = {
        weight: `WEIGHT`
        , minVp: `MIN_VP`
    }
;

for (let propValue in parameterList) {
    Object.defineProperty(
        SettingsParam
        , parameterList[propValue]
        , {
            value: propValue
            , writable: false
            , enumerable: true
            , configurable : false
        }
    );
}

module.exports = SettingsParam;
