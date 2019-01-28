'use strict';

const faker = require(`faker`)
    , sandbox = require(`sinon`).createSandbox()
    , { ConfigProvider, ConfigParam } = require(`../../config/index`)
    , CommandHandler = require(`../../command/CommandHandler`)
    , ConfigCommand = require(`../../command/ConfigCommand`)
    , MessageHelper = require(`../../helper/MessageHelper`)
    , TestHelper = require(`../TestHelper`)
    , commandName = ConfigCommand.getName()
;

describe(`ConfigCommand`, () => {

    before(async () => {
        CommandHandler.register();
        await ConfigProvider.init();
    });

    afterEach(() => {
        // completely restore all fakes created through the sandbox
        sandbox.restore();
    });

    it(`should check permission of user to use "config" command`, () => {
        // given
        const stubChannel = TestHelper.buildCommunicationChannelStub();

        const mockConfig = sandbox.mock(ConfigProvider);
        mockConfig.expects(`set`).never();

        // when
        CommandHandler.run(commandName, [], stubChannel);

        // then
        sandbox.assert.calledOnce(stubChannel.getAuthorId);
        sandbox.assert.notCalled(stubChannel.getChatId);
        sandbox.assert.calledOnce(stubChannel.sendMessage);
        sandbox.assert.calledWith(
            stubChannel.sendMessage
            , MessageHelper.formatAccessDenied({ command: commandName })
        );

        mockConfig.verify();
    });

    it(`should return info about command on no params`, () => {
        // given
        const stubChannel = TestHelper.buildCommunicationChannelStub(
            ConfigProvider.get(ConfigParam.ADMIN_ID)
        );

        const mockConfig = sandbox.mock(ConfigProvider);
        mockConfig.expects(`set`).never();

        // when
        CommandHandler.run(ConfigCommand.getName(), [], stubChannel);

        // then
        sandbox.assert.calledOnce(stubChannel.getAuthorId);
        sandbox.assert.notCalled(stubChannel.getChatId);
        sandbox.assert.calledOnce(stubChannel.sendMessage);
        sandbox.assert.calledWith(
            stubChannel.sendMessage
            , MessageHelper.formatConfigInfo({ command: commandName })
        );

        mockConfig.verify();
    });

    it(`should return value of config parameter if only it name given`, () => {
        // given
        const configParamName = ConfigParam.WEIGHT
            , stubChannel = TestHelper.buildCommunicationChannelStub(
                ConfigProvider.get(ConfigParam.ADMIN_ID)
            )
        ;
        const mockConfig = sandbox.mock(ConfigProvider);
        mockConfig.expects(`set`).never();

        // when
        CommandHandler.run(ConfigCommand.getName(), [configParamName], stubChannel);

        // then
        sandbox.assert.calledOnce(stubChannel.getAuthorId);
        sandbox.assert.notCalled(stubChannel.getChatId);
        sandbox.assert.calledOnce(stubChannel.sendMessage);
        sandbox.assert.calledWith(
            stubChannel.sendMessage
            , MessageHelper.formatConfigParamValue({
                param: configParamName
                , value: ConfigProvider.get(configParamName)
            })
        );

        mockConfig.verify();
    });

    it(`should return "null" as value of non existing param`, () => {
        // given
        const configParamName = faker.random.alphaNumeric(16)
            , stubChannel = TestHelper.buildCommunicationChannelStub(
                ConfigProvider.get(ConfigParam.ADMIN_ID)
            )
        ;
        const mockConfig = sandbox.mock(ConfigProvider);
        mockConfig.expects(`set`).never();

        // when
        CommandHandler.run(ConfigCommand.getName(), [configParamName], stubChannel);

        // then
        sandbox.assert.calledOnce(stubChannel.getAuthorId);
        sandbox.assert.notCalled(stubChannel.getChatId);
        sandbox.assert.calledOnce(stubChannel.sendMessage);
        sandbox.assert.calledWith(
            stubChannel.sendMessage
            , MessageHelper.formatConfigParamValue({
                param: configParamName
                , value: `null`
            })
        );

        mockConfig.verify();
    });

    it(`should change value of config parameter`, (done) => {
        // given
        const configParamName = ConfigParam.WEIGHT
            , configParamValue = ConfigProvider.get(configParamName)
            , adminId = ConfigProvider.get(ConfigParam.ADMIN_ID)
            , stubChannel = TestHelper.buildCommunicationChannelStub(adminId)
        ;

        let configParamNewValue = null;
        do {
            configParamNewValue = faker.random.number(100);
        } while (configParamNewValue === configParamValue);

        const mockConfig = sandbox.mock(ConfigProvider);
        mockConfig.expects(`set`)
            .once().withExactArgs(configParamName, configParamNewValue)
            .resolves(true)
        ;
        mockConfig.expects(`get`)
            .withExactArgs(configParamName)
            .returns(configParamNewValue)
        ;
        mockConfig.expects(`get`)
            .withExactArgs(ConfigParam.ADMIN_ID)
            .returns(adminId)
        ;

        // when
        CommandHandler.run(
            ConfigCommand.getName()
            , [configParamName, configParamNewValue]
            , stubChannel
        );

        // then
        setTimeout(() => {
            mockConfig.verify();

            sandbox.assert.calledOnce(stubChannel.getAuthorId);
            sandbox.assert.notCalled(stubChannel.getChatId);
            sandbox.assert.calledOnce(stubChannel.sendMessage);
            sandbox.assert.calledWith(
                stubChannel.sendMessage
                , MessageHelper.formatConfigParamValueChanged({
                    param: configParamName
                    , value: configParamNewValue
                })
            );

            done();
        }, 100);
    });

    it(`should perform validation of new param value`, () => {
        // given
        const configParamName = ConfigParam.WEIGHT
            , configParamValue = ConfigProvider.get(configParamName)
            , configParamNewValue = faker.random.word(`commerce.department`)
            , stubChannel = TestHelper.buildCommunicationChannelStub(
                ConfigProvider.get(ConfigParam.ADMIN_ID)
            )
        ;

        const mockConfig = sandbox.mock(ConfigProvider);
        mockConfig.expects(`set`).never();

        // when
        CommandHandler.run(
            ConfigCommand.getName()
            , [configParamName, configParamNewValue]
            , stubChannel
        );

        // then
        const configParamCurrentValue = ConfigProvider.get(configParamName);
        configParamCurrentValue.should.equal(
            configParamValue
            , `Config param should not be changed.`
        );

        sandbox.assert.calledOnce(stubChannel.getAuthorId);
        sandbox.assert.notCalled(stubChannel.getChatId);
        sandbox.assert.calledOnce(stubChannel.sendMessage);
        sandbox.assert.calledWith(
            stubChannel.sendMessage
            , sandbox.match(MessageHelper.formatConfigParamValueError({
                param: configParamName
                , error: ``
            }))
        );

        mockConfig.verify();
    });

});
