'use strict';

const faker = require(`faker`)
    , sandbox = require(`sinon`).createSandbox()
    , { Collection, Cursor } = require(`mongodb`)
    , Tool = require(`../../Tool`)
    , { ConfigProvider } = require(`../../config/index`)
    , { SettingsProvider, SettingsParam } = require(`../../settings/index`)
    , TestHelper = require(`../TestHelper`)
;

describe(`SettingsProvider`, () => {

    afterEach(() => {
        // completely restore all fakes created through the sandbox
        sandbox.restore();

        SettingsProvider.reset();
    });

    describe(`init`, () => {

        it(`should successfully init with required options`, async () => {
            // given
            const stubMongo = sandbox.createStubInstance(Collection)
                , appId = faker.random.alphaNumeric(8)
            ;

            let errorObj = null;

            // when
            try {
                await SettingsProvider.init({ mongo: stubMongo, appId: appId });
            } catch (err) {
                errorObj = err;
            }

            // then
            should.equal(errorObj, null, `Init should be perform without Error.`);
        });

        it(`should fail without "appId" option`, async () => {
            // given
            const stubMongo = sandbox.createStubInstance(Collection)
            ;

            let errorObj = null;

            // when
            try {
                await SettingsProvider.init({ mongo: stubMongo });
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.instanceOf(
                Error
                , `Init should throw an Error if "appId" was not provide.`
            );
        });

        it(`should fail if init without "mongo" connection`, async () => {
            // given
            const appId = faker.random.alphaNumeric(8)
            ;

            let errorObj = null;

            // when
            try {
                await SettingsProvider.init({ appId: appId });
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.instanceOf(Error, `Init should throw Error if "mongo" was not provided.`);
        });

        it(`should fail if received "mongo" is not right instance`, async () => {
            // given
            const stubMongo = sandbox.createStubInstance(SettingsProvider)
                , appId = faker.random.alphaNumeric(8)
            ;

            let errorObj = null;

            // when
            try {
                await SettingsProvider.init({ mongo: stubMongo, appId: appId });
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.instanceOf(
                Error
                , `Init should throw an Error if received "mongo" is not right instance.`
            );
        });

        it(`should fail if received "appId" is empty string`, async () => {
            // given
            const stubMongo = sandbox.createStubInstance(Collection)
            ;

            let errorObj = null;

            // when
            try {
                await SettingsProvider.init({ mongo: stubMongo, appId: `` });
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.instanceOf(
                Error
                , `Init should throw an Error if received "appId" is empty string.`
            );
        });

    });

    describe(`get`, () => {

        it(`should throw error if Settings was not initialized`, async () => {
            // given
            const userId = faker.random.number();
            let errorObj = null;

            // when
            try {
                await SettingsProvider.get(userId);
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.be.an.instanceof(Error);
        });

        it(`should return existing user parameter`, async () => {
            // given
            const {
                    stubMongo
                    , stubCursor
                    , appId
                    , userId
                    , userSettings
                } = await TestHelper.settingsBuildFakeData()
                , paramName = SettingsParam.WEIGHT
            ;

            // when
            const userParamValue = await SettingsProvider.get(userId, paramName);

            // then
            userParamValue.should.equal(
                userSettings[paramName]
                , `Should return correct value of param.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

        it(`should query data from Mongo only once for same user parameters`, async () => {
            // given
            const {
                    stubMongo
                    , stubCursor
                    , appId
                    , userId
                    , userSettings
                } = await TestHelper.settingsBuildFakeData()
                , paramName1 = SettingsParam.WEIGHT
                , paramName2 = SettingsParam.MIN_VP
            ;

            // when
            const userParamValue1 = await SettingsProvider.get(userId, paramName1)
                , userParamValue2 = await SettingsProvider.get(userId, paramName2)
            ;

            // then
            userParamValue1.should.equal(
                userSettings[paramName1]
                , `Should return correct value of first param.`
            );
            userParamValue2.should.equal(
                userSettings[paramName2]
                , `Should return correct value of second param.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

        it(`should query data from Mongo for each user`, async () => {
            // given
            const stubMongo = sandbox.createStubInstance(Collection)
                , stubCursor = sandbox.createStubInstance(Cursor)
                , appId = faker.random.alphaNumeric(8)
                , userId1 = faker.random.number().toString()
                , paramName = SettingsParam.WEIGHT
                , paramValue1 = faker.random.number()
                , userSettings1 = {}
                , userSettings2 = {}
            ;
            userSettings1[paramName] = paramValue1;

            let userId2 = null
                , paramValue2 = null
            ;
            do {
                userId2 = faker.random.number().toString();
            } while (userId2 === userId1);
            do {
                paramValue2 = faker.random.number();
            } while (paramValue2 === paramValue1);
            userSettings2[paramName] = paramValue2;

            stubMongo.find.returns(stubCursor);
            stubCursor.toArray.onCall(0).resolves([userSettings1]);
            stubCursor.toArray.onCall(1).resolves([userSettings2]);

            // when
            await SettingsProvider.init({ mongo: stubMongo, appId: appId });
            const userParamValue1 = await SettingsProvider.get(userId1, paramName)
                , userParamValue2 = await SettingsProvider.get(userId2, paramName)
            ;

            // then
            userParamValue1.should.equal(
                paramValue1
                , `Should return correct value for first user.`
            );
            userParamValue2.should.equal(
                paramValue2
                , `Should return correct value for second user.`
            );

            sandbox.assert.calledTwice(stubMongo.find);
            sandbox.assert.calledWithExactly(
                stubMongo.find.firstCall
                , { appId: appId, userId: userId1 }
            );
            sandbox.assert.calledWithExactly(
                stubMongo.find.secondCall
                , { appId: appId, userId: userId2 }
            );
            sandbox.assert.calledTwice(stubCursor.toArray);
            sandbox.assert.callOrder(
                stubMongo.find
                , stubCursor.toArray
            );

            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

        it(`should return all user params if "paramName" not provided`, async () => {
            // given
            const {
                stubMongo
                , stubCursor
                , appId
                , userId
                , userSettings
            } = await TestHelper.settingsBuildFakeData();

            // when
            const userReceivedSettings = await SettingsProvider.get(userId);

            // then
            userReceivedSettings.should.deep.equal(
                userSettings
                , `Should return correct user settings.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

        it(`should return null for non existing parameter`, async () => {
            // given
            const {
                    stubMongo
                    , stubCursor
                    , appId
                    , userId
                } = await TestHelper.settingsBuildFakeData()
                , paramNameRandom = faker.random.alphaNumeric(16)
            ;

            // when
            const userReceivedValue = await SettingsProvider.get(
                userId
                , paramNameRandom
            );

            // then
            should.equal(
                userReceivedValue
                , null
                , `Should return NULL if param not exists.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

        it(`should return default value for non existing parameter`, async () => {
            // given
            const {
                    stubMongo
                    , stubCursor
                    , appId
                    , userId
                } = await TestHelper.settingsBuildFakeData()
                , paramNameRandom = faker.random.alphaNumeric(16)
                , defaultValue = faker.random.alphaNumeric(32)
            ;

            // when
            const userReceivedValue = await SettingsProvider.get(
                userId
                , paramNameRandom
                , defaultValue
            );

            // then
            userReceivedValue.should.equal(
                defaultValue
                , `Should return default value if param not exists.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

        it(`should return existing user parameter not default value`, async () => {
            // given
            const {
                    stubMongo
                    , stubCursor
                    , appId
                    , userId
                    , userSettings
                } = await TestHelper.settingsBuildFakeData()
                , paramName = SettingsParam.WEIGHT
                , paramDefaultValue = faker.random.alphaNumeric(16)
            ;

            // when
            const userParamValue = await SettingsProvider.get(
                userId
                , paramName
                , paramDefaultValue
            );

            // then
            userParamValue.should.equal(
                userSettings[paramName]
                , `Should return correct value of param.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

        it(`should not parse ENV variables format`, async () => {
            // given
            const paramName = SettingsParam.WEIGHT
                , paramEnvName = `TEST_ENV_PARAM`
                , userNewSettings = {}
            ;
            process.env[paramEnvName] = faker.random.number();
            userNewSettings[paramName] = ConfigProvider.ENV_VARIABLE_PREFIX + paramEnvName;

            const {
                stubMongo
                , stubCursor
                , appId
                , userId
            } = await TestHelper.settingsBuildFakeData(userNewSettings);

            // when
            const userParamValue = await SettingsProvider.get(userId, paramName);

            // then
            userParamValue.should.equal(
                userNewSettings[paramName]
                , `Should return correct value of param.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

        it(`should return default value as all parameters if result is empty object`, async () => {
            // given
            const {
                    stubMongo
                    , stubCursor
                    , appId
                    , userId
                } = await TestHelper.settingsBuildFakeData(null)
                , defaultSettings = { some: `data`, second: `values` }
            ;

            // when
            const userReceivedSettings = await SettingsProvider.get(
                userId
                , null
                , defaultSettings
            );

            // then
            userReceivedSettings.should.deep.equal(
                defaultSettings
                , `Should return default user settings.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

        it(`should merge default value to all parameters case`, async () => {
            // given
            const {
                    stubMongo
                    , stubCursor
                    , appId
                    , userId
                    , userSettings
                } = await TestHelper.settingsBuildFakeData()
                , defaultSettings = { some: `data`, second: `values` }
            ;

            // when
            const userReceivedSettings = await SettingsProvider.get(
                userId
                , null
                , defaultSettings
            );

            // then
            userReceivedSettings.should.deep.include(
                userSettings
                , `Should return stored user settings.`
            );
            userReceivedSettings.should.deep.include(
                defaultSettings
                , `Should return merged default user settings.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

        it(`should use stored values instead default ones in all parameters case`, async () => {
            // given
            const {
                    stubMongo
                    , stubCursor
                    , appId
                    , userId
                    , userSettings
                } = await TestHelper.settingsBuildFakeData()
                , defaultSettings = {}
                , paramName = SettingsParam.WEIGHT
            ;
            do {
                defaultSettings[paramName] = faker.random.number();
            } while (defaultSettings[paramName] === userSettings[paramName]);

            // when
            const userReceivedSettings = await SettingsProvider.get(
                userId
                , null
                , defaultSettings
            );

            // then
            userReceivedSettings.should.deep.equal(
                userSettings
                , `Should return stored user settings.`
            );
            userReceivedSettings.should.deep.not.include(
                defaultSettings
                , `Should not use default user settings instead stored one.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
            TestHelper.settingsAssertChangeNotCalled(stubMongo);
        });

    });

    describe(`set`, () => {

        it(`should change user Settings and insert it in Mongo for new data`, async () => {
            // given
            const {
                    stubMongo
                    , stubCursor
                    , appId
                    , userId
                    , userSettings
                } = await TestHelper.settingsBuildFakeData()
                , paramName = SettingsParam.WEIGHT
            ;

            let newParamValue = null;
            do {
                newParamValue = faker.random.number({ min: 0.01, max: 100 });
            } while (newParamValue === userSettings[paramName]);

            // when
            await SettingsProvider.set(userId, paramName, newParamValue);

            // then
            should.equal(
                await SettingsProvider.get(userId, paramName)
                , newParamValue
                , `New value of param should be returned.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );

            let userSettingsCheck = Tool.jsonCopy(
                userSettings
                , { appId: appId, userId: userId }
            );
            userSettingsCheck[paramName] = newParamValue;

            sandbox.assert.notCalled(stubMongo.updateOne);
            sandbox.assert.calledOnce(stubMongo.insertOne);
            sandbox.assert.calledWithExactly(
                stubMongo.insertOne
                , userSettingsCheck
            );
        });

        it(`should change user Settings and update it in Mongo for existing data`, async () => {
            // given
            const {
                    stubMongo
                    , stubCursor
                    , appId
                    , userId
                    , userSettings
                } = await TestHelper.settingsBuildFakeData(
                    { _id: faker.random.alphaNumeric(24) }
                )
                , paramName = SettingsParam.WEIGHT
            ;

            let newParamValue = null;
            do {
                newParamValue = faker.random.number({ min: 0.01, max: 100 });
            } while (newParamValue === userSettings[paramName]);

            // when
            await SettingsProvider.set(userId, paramName, newParamValue);

            // then
            should.equal(
                await SettingsProvider.get(userId, paramName)
                , newParamValue
                , `New value of param should be returned.`
            );

            TestHelper.settingsAssertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );

            userSettings[paramName] = newParamValue;

            sandbox.assert.notCalled(stubMongo.insertOne);
            sandbox.assert.calledOnce(stubMongo.updateOne);
            sandbox.assert.calledWithExactly(
                stubMongo.updateOne
                , { _id: userSettings[`_id`] }
                , { $set: userSettings }
            );
        });

    });

});
