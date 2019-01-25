'use strict';

const faker = require(`faker`)
    , sandbox = require(`sinon`).createSandbox()
    , { Collection, Cursor } = require(`mongodb`)
    , { ConfigProvider } = require(`../../config/index`)
    , SettingsProvider = require(`../../settings/SettingsProvider`)
    , SettingsParam = require(`../../settings/SettingsParam`)
;

describe.only(`SettingsProvider`, () => {

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
            const { stubMongo, stubCursor, appId, userId, userSettings } = await buildFakeData()
                , paramName = SettingsParam.WEIGHT
            ;

            // when
            const userParamValue = await SettingsProvider.get(userId, paramName);

            // then
            userParamValue.should.equal(
                userSettings[paramName]
                , `Should return correct value of param.`
            );

            assertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
        });

        it(`should query data from Mongo only once for same user parameters`, async () => {
            // given
            const { stubMongo, stubCursor, appId, userId, userSettings } = await buildFakeData()
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

            assertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
        });

        it(`should query data from Mongo for each user`, async () => {
            // given
            const stubMongo = sandbox.createStubInstance(Collection)
                , stubCursor = sandbox.createStubInstance(Cursor)
                , appId = faker.random.alphaNumeric(8)
                , userId1 = faker.random.number()
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
                userId2 = faker.random.number();
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
        });

        it(`should return all user params if "paramName" not provided`, async () => {
            // given
            const { stubMongo, stubCursor, appId, userId, userSettings } = await buildFakeData();

            // when
            const userReceivedSettings = await SettingsProvider.get(userId);

            // then
            userReceivedSettings.should.equal(
                userSettings
                , `Should return correct user settings.`
            );

            assertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
        });

        it(`should return null for non existing parameter`, async () => {
            // given
            const { stubMongo, stubCursor, appId, userId } = await buildFakeData()
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

            assertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
        });

        it(`should return default value for non existing parameter`, async () => {
            // given
            const { stubMongo, stubCursor, appId, userId } = await buildFakeData()
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

            assertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
        });

        it(`should return existing user parameter not default value`, async () => {
            // given
            const { stubMongo, stubCursor, appId, userId, userSettings } = await buildFakeData()
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

            assertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
        });

        it(`should not parse ENV variables format`, async () => {
            // given
            const paramName = SettingsParam.WEIGHT
                , paramEnvName = `TEST_ENV_PARAM`
                , userNewSettings = {}
            ;
            process.env[paramEnvName] = faker.random.number();
            userNewSettings[paramName] = ConfigProvider.ENV_VARIABLE_PREFIX + paramEnvName;

            const { stubMongo, stubCursor, appId, userId } = await buildFakeData(userNewSettings);

            // when
            const userParamValue = await SettingsProvider.get(userId, paramName);

            // then
            userParamValue.should.equal(
                userNewSettings[paramName]
                , `Should return correct value of param.`
            );

            assertFindCall(
                stubMongo
                , stubCursor
                , { appId: appId, userId: userId }
            );
        });

    });

    describe.skip(`set`, () => {

        it(`should update user Settings and store it in Mongo`, async () => {
            // given
            const paramName = SettingsParam.WEIGHT
                , paramValue = faker.random.number({ min: 0.01, max: 100 })
                , userDataOld = {}
                , userDataNew = {}
            ;
            userDataOld[paramName] = paramValue;

            let newParamValue = null;
            do {
                newParamValue = faker.random.number({ min: 0.01, max: 100 });
            } while (newParamValue === paramValue);
            userDataNew[paramName] = newParamValue;

            const stubMongo = sandbox.createStubInstance(Collection)
                , appId = faker.random.alphaNumeric(8)
            ;

            // when
            await ConfigProvider.init({ path: configPath });
            await ConfigProvider.set(paramName, newParamValue);

            // then
            should.equal(
                ConfigProvider.get(paramName)
                , newParamValue
                , `ConfigProvider should return new value of parameter`
            );

            mockFs.verify();
        });

        it(`should not update random config param`, async () => {
            // given
            const paramName = faker.random.alphaNumeric(16)
                , newParamValue = faker.random.number()
                , mockFs = sandbox.mock(fs.promises)
            ;
            createConfigFiles(JSON.stringify({}));

            mockFs.expects(`writeFile`).never();

            // when
            await ConfigProvider.init({ path: configPath });
            await ConfigProvider.set(paramName, newParamValue);

            // then
            should.equal(
                ConfigProvider.get(paramName)
                , null
                , `ConfigProvider should return "null" for non existing param.`
            );

            mockFs.verify();
        });

        it(`should use Redis for runtime config`, async () => {
            // given
            const paramName = ConfigParam.WEIGHT
                , paramValue = faker.random.number({ min: 0.01, max: 100 })
                , redisUrl = `redis://` + faker.random.alphaNumeric(7)
                , stubRedis = sandbox.createStubInstance(ConfigRedisAdapter)
                , mockRedis = sandbox.mock(ConfigRedisAdapter)
                , mockFs = sandbox.mock(fs.promises)
                , configData = {}
            ;
            configData[paramName] = paramValue;
            createConfigFiles(JSON.stringify(configData));

            let newParamValue = null;
            do {
                newParamValue = faker.random.number({ min: 0.01, max: 100 });
            } while (newParamValue === paramValue);
            configData[paramName] = newParamValue;

            mockFs.expects(`writeFile`).never();

            stubRedis.get.resolves({});
            stubRedis.set.resolves();
            mockRedis.expects(`instance`)
                .once().withExactArgs(redisUrl)
                .returns(stubRedis)
            ;

            // when
            await ConfigProvider.init({ path: configPath, redis: redisUrl });
            await ConfigProvider.set(paramName, newParamValue);

            // then
            should.equal(
                ConfigProvider.get(paramName)
                , newParamValue
                , `ConfigProvider should return new value of parameter`
            );

            mockFs.verify();

            sandbox.assert.calledOnce(stubRedis.get);
            sandbox.assert.calledOnce(stubRedis.set);
            sandbox.assert.calledWithExactly(stubRedis.set, configData);
        });

    });

});

async function buildFakeData(requiredSettings = {}) {
    const stubMongo = sandbox.createStubInstance(Collection)
        , stubCursor = sandbox.createStubInstance(Cursor)
        , appId = faker.random.alphaNumeric(8)
    ;
    let userSettings = {};
    userSettings[SettingsParam.WEIGHT] = faker.random.number();
    userSettings[SettingsParam.MIN_VP] = faker.random.number();

    userSettings = Object.assign(userSettings, requiredSettings);

    stubMongo.find.returns(stubCursor);
    stubCursor.toArray.resolves([userSettings]);

    await SettingsProvider.init({ mongo: stubMongo, appId: appId });

    return {
        appId: appId
        , userId: faker.random.number()
        , userSettings: userSettings
        , stubMongo: stubMongo
        , stubCursor: stubCursor
    }
}

function assertFindCall(stubMongo, stubCursor, findArg) {
    sandbox.assert.calledOnce(stubMongo.find);
    sandbox.assert.calledWithExactly(stubMongo.find, findArg);
    sandbox.assert.calledOnce(stubCursor.toArray);
    sandbox.assert.callOrder(stubMongo.find, stubCursor.toArray);
}
