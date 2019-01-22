'use strict';

const EventEmitter = require(`eventemitter3`)
    , AbstractChannel = require(`../bot/AbstractChannel`)
;

module.exports = class AbstractCommand {

    /**
     * Returns name of command
     * @returns {string}
     */
    static getName() {
        throw new Error(`Command should has a name.`);
    }

    /**
     * Provides list of possible names for command
     * @returns {string[]}
     */
    static getAliases() {
        return [];
    }

    /**
     * Runs command
     * @param {Array}           params
     * @param {AbstractChannel} channel
     */
    static run(params, channel) {
        throw new Error(`Command should do something.`);
    }

    /**
     * @param {EventEmitter} emitter
     */
    static register(emitter) {
        const instance = this
            , possibleEvents = [...[instance.getName()], ...instance.getAliases()]
        ;

        possibleEvents.forEach((eventName) => {
            emitter.on(eventName, instance.run, instance);
        });
    }

};
