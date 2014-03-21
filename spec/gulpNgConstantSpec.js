'use strict';

var ngConstant = require('../index');

describe('ngConstant.getConstants', function () {
    it('extends the data.constants with the options.constants', function () {
        var data = { constants: { hello: 'andrew' } };
        var opts = { constants: { hello: 'world' } };
        var result = ngConstant.getConstants(data, opts);
        expect(result).toEqual([{ name: 'hello', value: '"world"' }]);
    });

    it('returns an array with the constants key and json string value', function () {
        var data = { constants: { hello: { foo: 'bar' } } };
        var result = ngConstant.getConstants(data);
        expect(result).toEqual([{name: 'hello', value: '{"foo":"bar"}'}]);
    });

    it('stringifies the value with the given option.space', function () {
        var data = { constants: { hello: { foo: 'bar' } } };
        var result = ngConstant.getConstants(data, { space: '' });
        expect(result[0].value).toEqual('{"foo":"bar"}');
        result = ngConstant.getConstants(data, { space: ' ' });
        expect(result[0].value).toEqual('{\n "foo": "bar"\n}');
    });
});
