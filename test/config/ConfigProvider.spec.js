'use strict';

const faker = require(`faker`)
    , sandbox = require(`sinon`).createSandbox()
    , fs = require(`fs`)
    , Redis = require(`ioredis`)
    , ConfigProvider = require(`../../config/ConfigProvider`)
    , ConfigParam = require(`../../config/ConfigParam`)
    , configPath = __dirname + `/runtime`
    , configDistFilePath = configPath + `/config.json.dist`
    , configRuntimeFilename = `config.json`
    , configRuntimeFilePath = configPath + `/` + configRuntimeFilename
;

describe(`ConfigProvider`, () => {

    afterEach(() => {
        // completely restore all fakes created through the sandbox
        sandbox.restore();

        ConfigProvider.reset();

        // delete all test specific files
        if (fs.existsSync(configDistFilePath)) {
            fs.unlinkSync(configDistFilePath);
        }
        if (fs.existsSync(configRuntimeFilePath)) {
            fs.unlinkSync(configRuntimeFilePath);
        }
    });

    describe(`init`, () => {

        it(`should initialized without options`, async () => {
            // given

            // when
            await ConfigProvider.init();

            // then
            // do it without errors
        });

        it(`should throw exception if received "path" is not exists`, async () => {
            // given
            let errorObj = null;

            // when
            try {
                await ConfigProvider.init({path: faker.random.alphaNumeric(8)});
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.be.an.instanceof(Error);
        });

        it(`should throw exception if received "path" doesn't contain config file`, async () => {
            // given
            let errorObj = null;

            // when
            try {
                await ConfigProvider.init({path: __dirname});
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.be.an.instanceof(Error);
        });

        it(`should init with custom "path"`, async () => {
            // given
            const paramName = ConfigParam.WEIGHT
                , paramValue = faker.random.number()
                , configData = {}
            ;
            configData[paramName] = paramValue;

            createConfigFiles(JSON.stringify(configData));

            // when
            await ConfigProvider.init({ path: configPath });
            const resultValue = ConfigProvider.get(paramName);

            // then
            resultValue.should.eql(
                paramValue
                , `ConfigProvider should be init with custom path and get value there.`
            );
        });

        it(`should throw exception if "dist" config file is broken`, async () => {
            // given
            let errorObj = null;

            createConfigFiles(faker.random.alphaNumeric(8));

            // when
            try {
                await ConfigProvider.init({ path: configPath });
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.be.an.instanceof(Error);
        });

        it(`should not throw exception if "runtime" config file is broken`, async () => {
            // given
            let errorObj = null;

            createConfigFiles(
                JSON.stringify({ some: `data` })
                , faker.random.alphaNumeric(8)
            );

            const mockConsole = sandbox.mock(console);
            mockConsole.expects(`error`).once();

            // when
            try {
                await ConfigProvider.init({ path: configPath });
            } catch (err) {
                errorObj = err;
            }

            // then
            should.equal(errorObj, null);

            mockConsole.verify();
        });

        it(`should init with "redis" option without Error`, async () => {
            // given
            const stubRedis = sandbox.createStubInstance(Redis);
            stubRedis.get.resolves(JSON.stringify({}));

            createConfigFiles(JSON.stringify({ some: `data` }));

            // when
            await ConfigProvider.init({ path: configPath, redis: stubRedis });

            // then
        });

    });

    describe(`get`, () => {

        it(`should throw error in Config was not initialized`, async () => {
            // given
            const randomParameterName = faker.random.alphaNumeric(8);
            let errorObj = null;

            // when
            try {
                const randomParameter = ConfigProvider.get(randomParameterName);
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.be.an.instanceof(Error);
        });

        it(`should return null for non existing parameter`, async () => {
            // given
            const randomParameterName = faker.random.alphaNumeric(8);

            // when
            await ConfigProvider.init();
            const randomParameter = ConfigProvider.get(randomParameterName);

            // then
            should.equal(randomParameter, null, `NULL should be returned.`);
        });

        it(`should return existing parameter`, async () => {
            // given
            const paramName = ConfigParam.WEIGHT;

            // when
            await ConfigProvider.init();
            const weight = ConfigProvider.get(paramName);

            // then
            should.exist(weight);
        });

        it(`should override runtime config data over dist one`, async () => {
            // given
            const paramName = ConfigParam.WEIGHT
                , paramValueDist = faker.random.number()
                , configData = {}
                , configDataDist = {}
            ;
            let paramValue = null;

            do {
                paramValue = faker.random.number();
            } while (paramValue === paramValueDist);

            configDataDist[paramName] = paramValueDist;
            configData[paramName] = paramValue;

            createConfigFiles(
                JSON.stringify(configDataDist)
                , JSON.stringify(configData)
            );

            await ConfigProvider.init({ path: configPath });

            // when
            const resultValue = ConfigProvider.get(paramName);

            // then
            resultValue.should.eql(
                paramValue
                , `ConfigProvider should get current value from runtime config.`
            );
        });

        it(`should return "dist" value if "runtime" file broken`, async () => {
            // given
            const paramName = ConfigParam.WEIGHT
                , paramValueDist = faker.random.number()
                , configDataDist = {}
            ;
            configDataDist[paramName] = paramValueDist;

            createConfigFiles(
                JSON.stringify(configDataDist)
                , faker.random.alphaNumeric(8)
            );

            // disable output of error message in test status
            sandbox.stub(console, `error`);

            await ConfigProvider.init({ path: configPath });

            // when
            const resultValue = ConfigProvider.get(paramName);

            // then
            resultValue.should.eql(
                paramValueDist
                , `ConfigProvider should get value from "dist" config.`
            );
        });

        it(`should use ENV variables`, async () => {
            // given
            const paramName = ConfigParam.WEIGHT
                , paramValue = faker.random.number()
                , paramEnvName = `TEST_ENV_PARAM`
                , configData = {}
            ;

            process.env[paramEnvName] = paramValue;

            configData[paramName] = `$` + paramEnvName;

            createConfigFiles(JSON.stringify(configData));

            await ConfigProvider.init({ path: configPath });

            // when
            const resultValue = ConfigProvider.get(paramName);

            // then
            resultValue.should.equal(
                String(paramValue)
                , `ConfigProvider should get current value from runtime config.`
            );
        });

        it(`should return value from Redis if it configured`, async () => {
            // given
            const paramName = ConfigParam.WEIGHT
                , paramValueDist = faker.random.number()
                , configData = {}
            ;
            configData[paramName] = paramValueDist;

            createConfigFiles(JSON.stringify(configData));

            let paramValueRedis = null;
            do {
                paramValueRedis = faker.random.number();
            } while (paramValueRedis === paramValueDist);
            configData[paramName] = paramValueRedis;

            const stubRedis = sandbox.createStubInstance(Redis);
            stubRedis.get.resolves(JSON.stringify(configData));

            // when
            await ConfigProvider.init({ path: configPath, redis: stubRedis });
            const resultValue = ConfigProvider.get(paramName);

            // then
            resultValue.should.eql(
                paramValueRedis
                , `ConfigProvider should get value from "Redis" config.`
            );

            sandbox.assert.calledOnce(stubRedis.get);
            sandbox.assert.notCalled(stubRedis.set);
        });

        it(`should return "dist" value if Redis return empty data`, async () => {
            // given
            const paramName = ConfigParam.WEIGHT
                , paramValueDist = faker.random.number()
                , configData = {}
            ;
            configData[paramName] = paramValueDist;

            createConfigFiles(JSON.stringify(configData));

            const stubRedis = sandbox.createStubInstance(Redis);
            stubRedis.get.resolves(JSON.stringify({}));

            // when
            await ConfigProvider.init({ path: configPath, redis: stubRedis });
            const resultValue = ConfigProvider.get(paramName);

            // then
            resultValue.should.eql(
                paramValueDist
                , `ConfigProvider should get value from "dist" config.`
            );

            sandbox.assert.calledOnce(stubRedis.get);
            sandbox.assert.notCalled(stubRedis.set);
        });

    });

    describe(`set`, () => {

        it(`should update "runtime" config file and value of param by default`, async () => {
            // given
            const paramName = ConfigParam.WEIGHT
                , paramValue = faker.random.number({ min: 0.01, max: 100 })
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

            mockFs.expects(`writeFile`)
                .once().withExactArgs(configRuntimeFilePath, JSON.stringify(configData))
                .resolves(true)
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

            const stubRedis = sandbox.createStubInstance(Redis);
            stubRedis.get.resolves(JSON.stringify({}));
            stubRedis.set.resolves();

            // when
            await ConfigProvider.init({ path: configPath, redis: stubRedis });
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
            sandbox.assert.calledWithExactly(
                stubRedis.set
                , sandbox.match.typeOf(`string`)
                , JSON.stringify(configData)
            );
        });

    });

});

function createConfigFiles(distConfig, runtimeConfig = null) {
    fs.writeFileSync(configDistFilePath, distConfig);
    if (null !== runtimeConfig) {
        fs.writeFileSync(configRuntimeFilePath, runtimeConfig);
    }
}
