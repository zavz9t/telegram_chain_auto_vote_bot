'use strict';

const faker = require(`faker`)
    , Tool = require(`../Tool`)
;

describe(`Tool`, () => {

    describe(`jsonCopy`, () => {

        it(`should make a copy of object`, () => {
            // given
            const sourceObj = { some: faker.random.alphaNumeric(16) };

            // when
            const result = Tool.jsonCopy(sourceObj);

            // then
            result.should.deep.equal(
                sourceObj
                , `Object should be copied.`
            );

            result.random = faker.random.number();
            result.should.not.deep.equal(
                sourceObj
                , `Copied object should be independent.`
            );
        });

        it(`should add to copy new obj`, () => {
            // given
            const sourceObj = { some: faker.random.alphaNumeric(16) }
                , anotherObj = { second: faker.random.word() }
            ;

            // when
            const result = Tool.jsonCopy(sourceObj, anotherObj);

            // then
            result.should.deep.include(
                sourceObj
                , `Result Object should contain source obj.`
            );
            result.should.deep.include(
                anotherObj
                , `Result Object should contain another obj.`
            );

            result.random = faker.random.number();
            sourceObj.should.not.have.property(
                `random`
                , result.random
                , `Result obj should be independent from source one.`
            );
        });

        it(`should add to copy several objects`, () => {
            // given
            const sourceObj = { some: faker.random.alphaNumeric(16) }
                , anotherObj = { second: faker.random.word() }
                , finalObj = { final: faker.random.words() }
            ;

            // when
            const result = Tool.jsonCopy(sourceObj, anotherObj, finalObj);

            // then
            result.should.deep.include(
                sourceObj
                , `Result Object should contain source obj.`
            );
            result.should.deep.include(
                anotherObj
                , `Result Object should contain another obj.`
            );
            result.should.deep.include(
                finalObj
                , `Result Object should contain final obj.`
            );

            result.random = faker.random.number();
            sourceObj.should.not.have.property(
                `random`
                , result.random
                , `Result obj should be independent from source one.`
            );

            anotherObj.should.not.have.property(
                `random`
                , result.random
                , `Second obj in merge should be independent.`
            );
            finalObj.should.not.have.property(
                `random`
                , result.random
                , `Final obj in merge should be independent.`
            );
        });

    });

});
