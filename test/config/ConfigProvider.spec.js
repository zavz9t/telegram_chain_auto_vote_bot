'use strict';

const faker = require(`faker`)
    , { sprintf } = require(`sprintf-js`)
    , fs = require(`fs`)
    , ConfigProvider = require(`../../config/ConfigProvider`)
    , ConfigNotInitializedError = require(`../../config/ConfigNotInitializedError`)
    , ConfigInvalidArgumentError = require(`../../config/ConfigInvalidArgumentError`)
    , ConfigParam = require(`../../config/ConfigParam`)
    , configPath = __dirname + `/runtime`
    , configPathPattern = configPath + `/%s`
    , configDistFilePath = configPath + `/config.json.dist`
    , configFilePath = configPath + `/config.json`
;

describe(`ConfigProvider`, () => {

    afterEach(() => {
        ConfigProvider.reset();

        if (fs.existsSync(configDistFilePath)) {
            fs.unlinkSync(configDistFilePath);
        }
        if (fs.existsSync(configFilePath)) {
            fs.unlinkSync(configFilePath);
        }
    });

    describe(`init`, () => {

        it(`should initialized without options`, () => {
            // given

            // when
            ConfigProvider.init();

            // then
            // do it without errors
        });

        it(`should throw exception if received "path" is not exists`, () => {
            // given
            let errorObj = null;

            // when
            try {
                ConfigProvider.init({path: faker.random.alphaNumeric(8)});
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.be.an.instanceof(ConfigInvalidArgumentError);
        });

        it(`should throw exception if received "path" doesn't contain config file`, () => {
            // given
            let errorObj = null;

            // when
            try {
                ConfigProvider.init({path: __dirname});
            } catch (err) {
                errorObj = err;
            }

            // then
            errorObj.should.be.an.instanceof(ConfigInvalidArgumentError);
        });

        it(`should init with custom "path"`, () => {
            // given
            const paramName = ConfigParam.WEIGHT
                , paramValue = faker.random.number()
                , configData = {}
            ;
            configData[paramName] = paramValue;

            fs.writeFileSync(configDistFilePath, JSON.stringify(configData));

            // when
            ConfigProvider.init({ path: configPath });
            const resultValue = ConfigProvider.get(paramName);

            // then
            resultValue.should.eql(
                paramValue
                , `ConfigProvider should be init with custom path and get value there.`
            );
        });

    });

    describe(`get`, () => {

        it(`should throw error in Config was not initialized`, () => {
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
            errorObj.should.be.an.instanceof(ConfigNotInitializedError);
        });

        it(`should return null for non existing parameter`, () => {
            // given
            const randomParameterName = faker.random.alphaNumeric(8);

            // when
            ConfigProvider.init();
            const randomParameter = ConfigProvider.get(randomParameterName);

            // then
            should.equal(randomParameter, null, `NULL should be returned.`);
        });

        it(`should return existing parameter`, () => {
            // given
            const paramName = ConfigParam.WEIGHT;

            // when
            ConfigProvider.init();
            const weight = ConfigProvider.get(paramName);

            // then
            should.exist(weight);
        });

        it(`should override runtime config data over dist one`, () => {
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

            fs.writeFileSync(configDistFilePath, JSON.stringify(configDataDist));
            fs.writeFileSync(configFilePath, JSON.stringify(configData));

            ConfigProvider.init({ path: configPath });

            // when
            const resultValue = ConfigProvider.get(paramName);

            // then
            resultValue.should.eql(
                paramValue
                , `ConfigProvider should get current value from runtime config.`
            );
        });

        it(`should use ENV variables`, () => {
            // given
            const paramName = ConfigParam.WEIGHT
                , paramValue = faker.random.number()
                , paramEnvName = `TEST_ENV_PARAM`
                , configData = {}
            ;

            process.env[paramEnvName] = paramValue;

            configData[paramName] = `$` + paramEnvName;

            fs.writeFileSync(configDistFilePath, JSON.stringify(configData));

            ConfigProvider.init({ path: configPath });

            // when
            const resultValue = ConfigProvider.get(paramName);

            // then
            resultValue.should.equal(
                String(paramValue)
                , `ConfigProvider should get current value from runtime config.`
            );
        });

    });

    describe(`set`, () => {

        it(`should update runtime config file`, () => {
            // given
            fs.writeFileSync(runtimeConfigFile, JSON.stringify({}));

            const paramName = ConfigParameter.WEIGHT;
            let paramNewValue = null;
            do {
                paramNewValue = faker.random.number({min: 0.01, max: 100});
            } while (ConfigProvider.get(paramName) === paramNewValue);

            // when
            ConfigProvider.set(paramName, paramNewValue);

            // then
            should.equal(
                ConfigProvider.get(paramName)
                , paramNewValue
                , `ConfigProvider should return new value of parameter`
            );

            // check runtime file
            setTimeout(() => {
                const runtimeConfig = JSON.parse(fs.readFileSync(runtimeConfigFile, `utf8`));
                should.have.property(runtimeConfig, paramName, `Runtime config file should have updated parameter key.`);
                should.equal(
                    runtimeConfig[paramName]
                    , paramNewValue
                    , `Runtime config file should contain new value of updated parameter.`
                );
            }, 500); // wait until file be updated
        });

    });

});
