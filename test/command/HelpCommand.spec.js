'use strict';

const faker = require(`faker`)
    , sandbox = require(`sinon`).createSandbox()
    , CommandHandler = require(`../../command/CommandHandler`)
    , TelegramChannel = require(`../../bot/TelegramChannel`)
    , messages = require(`../../messages`)
    , commandName = `help`
    , commandAlias = `info`
;

describe(`HelpCommand`, () => {

    before(() => {
        CommandHandler.register();
    });

    afterEach(() => {
        // completely restore all fakes created through the sandbox
        sandbox.restore();
    });

    it(`should print info message`, () => {
        // given
        const stubChannel = sandbox.createStubInstance(TelegramChannel);

        stubChannel.getAuthorId.returns(faker.random.number());
        stubChannel.getChatId.returns(faker.random.number());
        stubChannel.sendMessage.resolves(true);

        // when
        CommandHandler.run(commandName, [], stubChannel);

        // then
        sandbox.assert.calledOnce(stubChannel.getAuthorId);
        sandbox.assert.notCalled(stubChannel.getChatId);
        sandbox.assert.calledOnce(stubChannel.sendMessage);
        sandbox.assert.calledWithExactly(stubChannel.sendMessage, messages.info);
    });

    it(`should print info message by alias`, () => {
        // given
        const stubChannel = sandbox.createStubInstance(TelegramChannel);

        stubChannel.getAuthorId.returns(faker.random.number());
        stubChannel.getChatId.returns(faker.random.number());
        stubChannel.sendMessage.resolves(true);

        // when
        CommandHandler.run(commandAlias, [], stubChannel);

        // then
        sandbox.assert.calledOnce(stubChannel.getAuthorId);
        sandbox.assert.notCalled(stubChannel.getChatId);
        sandbox.assert.calledOnce(stubChannel.sendMessage);
        sandbox.assert.calledWithExactly(stubChannel.sendMessage, messages.info);
    });

});
