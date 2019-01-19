'use strict';

/**
 * Contains list of available config parameters
 * @typedef {Object} ConfigParam
 * @property {string} WEIGHT Weight of vote
 * @property {string} MIN_VP Minimum value of VP when bot will perform vote.
 */
const ConfigParam = {}
    , parameterList = {
        weight: `WEIGHT`
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
