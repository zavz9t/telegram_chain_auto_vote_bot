'use strict';

const faker = require(`faker`)
    , sandbox = require(`sinon`).createSandbox()
    , SecurityHelper = require(`../SecurityHelper`)
    , { ConfigProvider, ConfigParam } = require(`../config/index`)
;

describe(`SecurityHelper`, () => {

    before(async () => {
        await ConfigProvider.init();
    });

    afterEach(() => {
        // completely restore all fakes created through the sandbox
        sandbox.restore();
    });

    it(`should grant access to public action to any user`, () => {
        // given

        // when
        const result = SecurityHelper.hasAccess(
            faker.random.number().toString()
            , SecurityHelper.PERMISSION_ANY
        );

        // then
        result.should.equal(
            true
            , `Random user should has access to public actions`
        );
    });

    it(`should grant access to public action to "admin" user`, () => {
        // given

        // when
        const result = SecurityHelper.hasAccess(
            ConfigProvider.get(ConfigParam.ADMIN_ID)
            , SecurityHelper.PERMISSION_ANY
        );

        // then
        result.should.equal(
            true
            , `Admin user should has access to "public" actions`
        );
    });

    it(`should grant access to "moderator" action to "admin" user`, () => {
        // given

        // when
        const result = SecurityHelper.hasAccess(
            ConfigProvider.get(ConfigParam.ADMIN_ID)
            , SecurityHelper.PERMISSION_MODERATOR
        );

        // then
        result.should.equal(
            true
            , `Admin user should has access to "moderator" actions`
        );
    });

    it(`should not grant access to "moderator" action to any user`, () => {
        // given
        const adminId = ConfigProvider.get(ConfigParam.ADMIN_ID);

        let randomId = null;
        do {
            randomId = faker.random.number().toString();
        } while (randomId === adminId);

        // when
        const result = SecurityHelper.hasAccess(
            randomId
            , SecurityHelper.PERMISSION_MODERATOR
        );

        // then
        result.should.equal(
            false
            , `Random user should hasn't access to "moderator" actions`
        );
    });

    it(`should grant access to "admin" action to "admin" user`, () => {
        // given

        // when
        const result = SecurityHelper.hasAccess(
            ConfigProvider.get(ConfigParam.ADMIN_ID)
            , SecurityHelper.PERMISSION_ADMIN
        );

        // then
        result.should.equal(
            true
            , `Admin user should has access to "admin" actions`
        );
    });

    it(`should not grant access to "admin" action to any user`, () => {
        // given
        const adminId = ConfigProvider.get(ConfigParam.ADMIN_ID);

        let randomId = null;
        do {
            randomId = faker.random.number().toString();
        } while (randomId === adminId);

        // when
        const result = SecurityHelper.hasAccess(
            randomId
            , SecurityHelper.PERMISSION_ADMIN
        );

        // then
        result.should.equal(
            false
            , `Random user should hasn't access to "admin" actions`
        );
    });

});
