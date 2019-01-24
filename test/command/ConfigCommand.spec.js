'use strict';

const faker = require(`faker`)
    , sandbox = require(`sinon`).createSandbox()
    , { ConfigProvider, ConfigParam } = require(`../../config/index`)
    , CommandHandler = require(`../../command/CommandHandler`)
    , ConfigCommand = require(`../../command/ConfigCommand`)
    , TelegramChannel = require(`../../bot/TelegramChannel`)
    , MessageHelper = require(`../../helper/MessageHelper`)
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
        const stubChannel = getChannelStub();

        const mockConfig = sandbox.mock(ConfigProvider);
        mockConfig.expects(`set`).never();

        // when
        CommandHandler.run(commandName, [], stubChannel);

        // then
        sandbox.assert.calledOnce(stubChannel.getAuthorId);
        sandbox.assert.notCalled(stubChannel.getChatId);
        sandbox.assert.calledOnce(stubChannel.sendMessage);
        sandbox.assert.calledWithExactly(
            stubChannel.sendMessage
            , MessageHelper.formatAccessDenied({
                prefix: ConfigProvider.get(ConfigParam.COMMAND_PREFIX)
                , command: commandName
            })
        );

        mockConfig.verify();
    });

    it(`should return info about command on no params`, () => {
        // given
        const stubChannel = getChannelStub(
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
        sandbox.assert.calledWithExactly(
            stubChannel.sendMessage
            , MessageHelper.formatConfigInfo({
                prefix: ConfigProvider.get(ConfigParam.COMMAND_PREFIX)
                , command: commandName
            })
        );

        mockConfig.verify();
    });

    it(`should return value of config parameter if only it name given`, () => {
        // given
        const configParamName = ConfigParam.WEIGHT
            , stubChannel = getChannelStub(
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
        sandbox.assert.calledWithExactly(
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
            , stubChannel = getChannelStub(
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
        sandbox.assert.calledWithExactly(
            stubChannel.sendMessage
            , MessageHelper.formatConfigParamValue({
                param: configParamName
                , value: `null`
            })
        );

        mockConfig.verify();
    });

    it.skip(`should change value of config parameter`, () => {
        // TODO: This case use Promise under the hood, so I don't know how to test it...
        // given
        const configParamName = ConfigParam.WEIGHT
            , configParamValue = ConfigProvider.get(configParamName)
            , stubChannel = getChannelStub(
                ConfigProvider.get(ConfigParam.ADMIN_ID)
            )
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

        // when
        CommandHandler.run(
            ConfigCommand.getName()
            , [configParamName, configParamNewValue]
            , stubChannel
        );

        // then
        sandbox.assert.calledOnce(stubChannel.getAuthorId);
        sandbox.assert.notCalled(stubChannel.getChatId);
        sandbox.assert.calledOnce(stubChannel.sendMessage);
        sandbox.assert.calledWithExactly(
            stubChannel.sendMessage
            , MessageHelper.formatConfigParamValueChanged({
                param: configParamName
                , value: configParamNewValue
            })
        );

        mockConfig.verify();
    });

    it(`should perform validation of new param value`, () => {
        // given
        const configParamName = ConfigParam.WEIGHT
            , configParamValue = ConfigProvider.get(configParamName)
            , configParamNewValue = faker.random.word(`commerce.department`)
            , stubChannel = getChannelStub(
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
        sandbox.assert.calledWithExactly(
            stubChannel.sendMessage
            , sandbox.match(MessageHelper.formatConfigParamValueError({
                param: configParamName
                , error: ``
            }))
        );

        mockConfig.verify();
    });

});

/**
 * Stubs communication channel
 * @param {string|null} authorId
 * @param {string|null} chatId
 * @param {*} messageResult
 *
 * @return {TelegramChannel}
 */
function getChannelStub(authorId = null, chatId = null, messageResult = true) {
    const stubChannel = sandbox.createStubInstance(TelegramChannel);

    stubChannel.getAuthorId.returns(authorId || faker.random.number().toString());
    stubChannel.getChatId.returns(chatId || faker.random.number().toString());
    stubChannel.sendMessage.resolves(messageResult);

    return stubChannel;
}