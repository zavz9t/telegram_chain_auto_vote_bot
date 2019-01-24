'use strict';

const faker = require(`faker`)
    , sandbox = require(`sinon`).createSandbox()
    , { Db } = require(`mongodb`)
    , SettingsProvider = require(`../../settings/SettingsProvider`)
    , SettingsParam = require(`../../settings/SettingsParam`)
    , SettingsMongoAdapter = require(`../../settings/SettingsMongoAdapter`)
;

describe(`SettingsProvider`, () => {

    afterEach(() => {
        // completely restore all fakes created through the sandbox
        sandbox.restore();

        SettingsProvider.reset();
    });

    describe(`init`, () => {

        it(`should successfully init with Mongo connection`, async () => {
            // given
            const stubMongo = sandbox.createStubInstance(Db);

            let errorObj = null;

            // when
            try {
                await SettingsProvider.init({ mongo: stubMongo });
            } catch (err) {
                errorObj = err;
            }

            // then
            should.equal(errorObj, null, `Init should be perform without Error.`);
        });

    });

    describe(`get`, () => {

        it(`should throw error if Settings was not initialized`, async () => {
            // given
            const userId = faker.random.number();
            let errorObj = null;

            // when
            try {
                const settings = await SettingsProvider.get(userId);
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.be.an.instanceof(Error);
        });

        // it(`should return existing user parameters`, async () => {
        //     // given
        //     const mongoUrl = `mongodb://` + faker.random.alphaNumeric(16)
        //         , userId = faker.random.number()
        //         , mockMongo = sandbox.mock(MongoClient)
        //     ;
        //
        //     mockMongo.expects(`connect`)
        //         .once().withExactArgs(mongoUrl)
        //         .resolves(`all fine`)
        //     ;
        //
        //     // when
        //     await SettingsProvider.init({ mongo: mongoUrl });
        //     const userParams = SettingsProvider.get(userId);
        //
        //     // then
        //     should.exist(weight);
        // });

        // it(`should return null for non existing parameter`, async () => {
        //     // given
        //     const randomParameterName = faker.random.alphaNumeric(8);
        //
        //     // when
        //     await ConfigProvider.init();
        //     const randomParameter = ConfigProvider.get(randomParameterName);
        //
        //     // then
        //     should.equal(randomParameter, null, `NULL should be returned.`);
        // });
        //
        // it(`should override runtime config data over dist one`, async () => {
        //     // given
        //     const paramName = ConfigParam.WEIGHT
        //         , paramValueDist = faker.random.number()
        //         , configData = {}
        //         , configDataDist = {}
        //     ;
        //     let paramValue = null;
        //
        //     do {
        //         paramValue = faker.random.number();
        //     } while (paramValue === paramValueDist);
        //
        //     configDataDist[paramName] = paramValueDist;
        //     configData[paramName] = paramValue;
        //
        //     createConfigFiles(
        //         JSON.stringify(configDataDist)
        //         , JSON.stringify(configData)
        //     );
        //
        //     await ConfigProvider.init({ path: configPath });
        //
        //     // when
        //     const resultValue = ConfigProvider.get(paramName);
        //
        //     // then
        //     resultValue.should.eql(
        //         paramValue
        //         , `ConfigProvider should get current value from runtime config.`
        //     );
        // });
        //
        // it(`should return "dist" value if "runtime" file broken`, async () => {
        //     // given
        //     const paramName = ConfigParam.WEIGHT
        //         , paramValueDist = faker.random.number()
        //         , configDataDist = {}
        //     ;
        //     configDataDist[paramName] = paramValueDist;
        //
        //     createConfigFiles(
        //         JSON.stringify(configDataDist)
        //         , faker.random.alphaNumeric(8)
        //     );
        //
        //     // disable output of error message in test status
        //     sandbox.stub(console, `error`);
        //
        //     await ConfigProvider.init({ path: configPath });
        //
        //     // when
        //     const resultValue = ConfigProvider.get(paramName);
        //
        //     // then
        //     resultValue.should.eql(
        //         paramValueDist
        //         , `ConfigProvider should get value from "dist" config.`
        //     );
        // });
        //
        // it(`should use ENV variables`, async () => {
        //     // given
        //     const paramName = ConfigParam.WEIGHT
        //         , paramValue = faker.random.number()
        //         , paramEnvName = `TEST_ENV_PARAM`
        //         , configData = {}
        //     ;
        //
        //     process.env[paramEnvName] = paramValue;
        //
        //     configData[paramName] = `$` + paramEnvName;
        //
        //     createConfigFiles(JSON.stringify(configData));
        //
        //     await ConfigProvider.init({ path: configPath });
        //
        //     // when
        //     const resultValue = ConfigProvider.get(paramName);
        //
        //     // then
        //     resultValue.should.equal(
        //         String(paramValue)
        //         , `ConfigProvider should get current value from runtime config.`
        //     );
        // });
        //
        // it(`should return value from Redis if it configured`, async () => {
        //     // given
        //     const paramName = ConfigParam.WEIGHT
        //         , paramValueDist = faker.random.number()
        //         , configData = {}
        //     ;
        //     configData[paramName] = paramValueDist;
        //
        //     createConfigFiles(JSON.stringify(configData));
        //
        //     const redisUrl = `redis://` + faker.random.alphaNumeric(16)
        //         , stubRedis = sandbox.createStubInstance(ConfigRedisAdapter)
        //         , mockRedis = sandbox.mock(ConfigRedisAdapter)
        //     ;
        //
        //     let paramValueRedis = null;
        //     do {
        //         paramValueRedis = faker.random.number();
        //     } while (paramValueRedis === paramValueDist);
        //     configData[paramName] = paramValueRedis;
        //
        //     stubRedis.get.resolves(configData);
        //     mockRedis.expects(`instance`)
        //         .once().withExactArgs(redisUrl)
        //         .returns(stubRedis)
        //     ;
        //
        //     // when
        //     await ConfigProvider.init({ path: configPath, redis: redisUrl });
        //     const resultValue = ConfigProvider.get(paramName);
        //
        //     // then
        //     resultValue.should.eql(
        //         paramValueRedis
        //         , `ConfigProvider should get value from "Redis" config.`
        //     );
        //
        //     sandbox.assert.calledOnce(stubRedis.get);
        //     sandbox.assert.notCalled(stubRedis.set);
        // });
        //
        // it(`should return "dist" value if Redis return empty data`, async () => {
        //     // given
        //     const paramName = ConfigParam.WEIGHT
        //         , paramValueDist = faker.random.number()
        //         , configData = {}
        //     ;
        //     configData[paramName] = paramValueDist;
        //
        //     createConfigFiles(JSON.stringify(configData));
        //
        //     const redisUrl = `redis://` + faker.random.alphaNumeric(16)
        //         , stubRedis = sandbox.createStubInstance(ConfigRedisAdapter)
        //         , mockRedis = sandbox.mock(ConfigRedisAdapter)
        //     ;
        //
        //     stubRedis.get.resolves({});
        //     mockRedis.expects(`instance`)
        //         .once().withExactArgs(redisUrl)
        //         .returns(stubRedis)
        //     ;
        //
        //     // when
        //     await ConfigProvider.init({ path: configPath, redis: redisUrl });
        //     const resultValue = ConfigProvider.get(paramName);
        //
        //     // then
        //     resultValue.should.eql(
        //         paramValueDist
        //         , `ConfigProvider should get value from "dist" config.`
        //     );
        //
        //     sandbox.assert.calledOnce(stubRedis.get);
        //     sandbox.assert.notCalled(stubRedis.set);
        // });

    });

    // describe(`set`, () => {
    //
    //     it(`should update "runtime" config file and value of param by default`, async () => {
    //         // given
    //         const paramName = ConfigParam.WEIGHT
    //             , paramValue = faker.random.number({ min: 0.01, max: 100 })
    //             , mockFs = sandbox.mock(fs.promises)
    //             , configData = {}
    //         ;
    //         configData[paramName] = paramValue;
    //         createConfigFiles(JSON.stringify(configData));
    //
    //         let newParamValue = null;
    //         do {
    //             newParamValue = faker.random.number({ min: 0.01, max: 100 });
    //         } while (newParamValue === paramValue);
    //         configData[paramName] = newParamValue;
    //
    //         mockFs.expects(`writeFile`)
    //             .once().withExactArgs(configRuntimeFilePath, JSON.stringify(configData))
    //             .resolves(true)
    //         ;
    //
    //         // when
    //         await ConfigProvider.init({ path: configPath });
    //         await ConfigProvider.set(paramName, newParamValue);
    //
    //         // then
    //         should.equal(
    //             ConfigProvider.get(paramName)
    //             , newParamValue
    //             , `ConfigProvider should return new value of parameter`
    //         );
    //
    //         mockFs.verify();
    //     });
    //
    //     it(`should not update random config param`, async () => {
    //         // given
    //         const paramName = faker.random.alphaNumeric(16)
    //             , newParamValue = faker.random.number()
    //             , mockFs = sandbox.mock(fs.promises)
    //         ;
    //         createConfigFiles(JSON.stringify({}));
    //
    //         mockFs.expects(`writeFile`).never();
    //
    //         // when
    //         await ConfigProvider.init({ path: configPath });
    //         await ConfigProvider.set(paramName, newParamValue);
    //
    //         // then
    //         should.equal(
    //             ConfigProvider.get(paramName)
    //             , null
    //             , `ConfigProvider should return "null" for non existing param.`
    //         );
    //
    //         mockFs.verify();
    //     });
    //
    //     it(`should use Redis for runtime config`, async () => {
    //         // given
    //         const paramName = ConfigParam.WEIGHT
    //             , paramValue = faker.random.number({ min: 0.01, max: 100 })
    //             , redisUrl = `redis://` + faker.random.alphaNumeric(7)
    //             , stubRedis = sandbox.createStubInstance(ConfigRedisAdapter)
    //             , mockRedis = sandbox.mock(ConfigRedisAdapter)
    //             , mockFs = sandbox.mock(fs.promises)
    //             , configData = {}
    //         ;
    //         configData[paramName] = paramValue;
    //         createConfigFiles(JSON.stringify(configData));
    //
    //         let newParamValue = null;
    //         do {
    //             newParamValue = faker.random.number({ min: 0.01, max: 100 });
    //         } while (newParamValue === paramValue);
    //         configData[paramName] = newParamValue;
    //
    //         mockFs.expects(`writeFile`).never();
    //
    //         stubRedis.get.resolves({});
    //         stubRedis.set.resolves();
    //         mockRedis.expects(`instance`)
    //             .once().withExactArgs(redisUrl)
    //             .returns(stubRedis)
    //         ;
    //
    //         // when
    //         await ConfigProvider.init({ path: configPath, redis: redisUrl });
    //         await ConfigProvider.set(paramName, newParamValue);
    //
    //         // then
    //         should.equal(
    //             ConfigProvider.get(paramName)
    //             , newParamValue
    //             , `ConfigProvider should return new value of parameter`
    //         );
    //
    //         mockFs.verify();
    //
    //         sandbox.assert.calledOnce(stubRedis.get);
    //         sandbox.assert.calledOnce(stubRedis.set);
    //         sandbox.assert.calledWithExactly(stubRedis.set, configData);
    //     });
    //
    // });

});
