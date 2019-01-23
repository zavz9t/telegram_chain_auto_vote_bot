'use strict';

const EventEmitter = require(`eventemitter3`)
    , { sprintf } = require(`sprintf-js`)
    , AccessDeniedError = require(`../error/AccessDeniedError`)
    , AbstractChannel = require(`../bot/AbstractChannel`)
    , SecurityHelper = require(`../helper/SecurityHelper`)
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
     * Returns required permission to execute command
     *
     * @return {string}
     */
    static getRequiredPermission() {
        return SecurityHelper.PERMISSION_ANY;
    }

    /**
     * Checks whether user has access to perform current command
     * @param {Array}           params
     * @param {AbstractChannel} channel
     */
    static accessCheck(params, channel) {
        const userId = channel.getAuthorId();
        if (
            false === SecurityHelper.hasAccess(
                userId
                , this.getRequiredPermission()
            )
        ) {
            throw new AccessDeniedError(sprintf(
                `User (%s) has no access to perform "%s" command.`
                , userId
                , this.getName()
            ));
        }
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
            emitter.on(eventName, instance.accessCheck, instance);
            emitter.on(eventName, instance.run, instance);
        });
    }

};
