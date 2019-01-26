'use strict';

let faker = require(`faker`)
    , sandbox = require(`sinon`).createSandbox()
    , { Collection, Cursor } = require(`mongodb`)
    , { SettingsProvider, SettingsParam } = require(`../settings/index`)
    , TelegramChannel = require(`../bot/TelegramChannel`)
    , Tool = require(`../Tool`)
;

class TestHelper {

    /**
     * Builds fake data stubs for SettingsProvider testing
     * @param {Object|null} requiredSettings Settings which need to add, or null - empty list should be returned
     *
     * @return {Promise<{appId: string, userId: string, userSettings: Object, stubMongo: Collection, stubCursor: Cursor}>}
     */
    static async settingsBuildFakeData(requiredSettings = {}) {
        const stubMongo = sandbox.createStubInstance(Collection)
            , stubCursor = sandbox.createStubInstance(Cursor)
            , appId = faker.random.alphaNumeric(8)
        ;
        let userSettings = {};
        userSettings[SettingsParam.WEIGHT] = faker.random.number();
        userSettings[SettingsParam.MIN_VP] = faker.random.number();

        if (null === requiredSettings) {
            userSettings = {};
        } else {
            userSettings = Tool.jsonCopy(userSettings, requiredSettings);
        }

        stubMongo.find.returns(stubCursor);

        stubMongo.insertOne.resolves({ result: { n: 1 } });
        stubMongo.updateOne.resolves({ result: { n: 1 } });

        stubCursor.toArray.resolves([userSettings]);

        await SettingsProvider.init({ mongo: stubMongo, appId: appId });

        return {
            appId: appId
            , userId: faker.random.number().toString()
            , userSettings: userSettings
            , stubMongo: stubMongo
            , stubCursor: stubCursor
        }
    }

    /**
     * Asserts that find for user settings was performed
     * @param {Collection} stubMongo
     * @param {Cursor} stubCursor
     * @param {Object} findArg
     */
    static settingsAssertFindCall(stubMongo, stubCursor, findArg) {
        sandbox.assert.calledOnce(stubMongo.find);
        sandbox.assert.calledWithExactly(stubMongo.find, findArg);
        sandbox.assert.calledOnce(stubCursor.toArray);
        sandbox.assert.callOrder(stubMongo.find, stubCursor.toArray);
    }

    /**
     * Asserts that no changes in user settings was performed
     * @param {Collection} stubMongo
     */
    static settingsAssertChangeNotCalled(stubMongo) {
        sandbox.assert.notCalled(stubMongo.insertOne);
        sandbox.assert.notCalled(stubMongo.updateOne);
    }

    /**
     * Stubs communication channel
     * @param {string|null} authorId
     * @param {string|null} chatId
     * @param {*} messageResult
     *
     * @return {TelegramChannel}
     */
    static buildCommunicationChannelStub(
        authorId = null
        , chatId = null
        , messageResult = true
    ) {
        const stubChannel = sandbox.createStubInstance(TelegramChannel);

        stubChannel.getAuthorId.returns(authorId || faker.random.number().toString());
        stubChannel.getChatId.returns(chatId || faker.random.number().toString());
        stubChannel.sendMessage.resolves(messageResult);

        return stubChannel;
    }

}

module.exports = TestHelper;
