'use strict';

var ngConstant = require('../index');
var _ = require('lodash');
var gutil = require('gulp-util');
var through = require('through2');

describe('ngConstant', function () {

    describe('name', function () {
        it ('uses the streamed file name by default', function (done) {
            getStream({path: 'myConstantsFile.json'})
            .pipe(ngConstant())
            .on('data', function (file) {
                expect(file.contents.toString()).toContain('module("myConstantsFile"');
                done();
            });
        });

        it ('creates a modules with "ngConstants" name by default for new streams', function (done) {
            evalNgConstant({name: undefined, stream: true}, function (_, output) {
                expect(output).toContain('module("ngConstants"');
                done();
            });
        });

        it ('creates a module with the given name', function (done) {
            evalNgConstant({name: 'myConstantsModule'}, function (_, output) {
                expect(output).toContain('module("myConstantsModule"');
                done();
            });
        });
    });

    describe('deps', function () {
        it ('creates a new modules by default', function (done) {
            evalNgConstant({name: 'defaultDeps', deps: undefined}, function (_, output) {
                expect(output).toContain('module("defaultDeps", [])');
                done();
            });
        });

        it ('adds the given dependencies', function (done) {
            evalNgConstant({name: 'withDeps', deps: ['ngAnimate']}, function (_, output) {
                expect(output).toContain('module("withDeps", ["ngAnimate"])');
                done();
            });
        });

        it ('adds constants to an existing module when set to `false`', function (done) {
            evalNgConstant({name: 'noDeps', deps: false}, function (_, output) {
               expect(output).toContain('module("noDeps")');
                done();
            });
        });
    });

    describe('stream', function () {
        it ('returns an empty open stream when set to `false`', function () {
            var plugin = ngConstant({stream: false});
            expect(plugin._readableState.ended).toBe(false);
            expect(plugin._readableState.length).toBe(0);
        });

        it ('returns a closed stream with a file when set to `true`', function () {
            var stream = ngConstant({stream: true});
            expect(stream._readableState.ended).toBe(true);
            expect(stream._readableState.length).toBe(1);
        });
    });
});

describe('ngConstant.getConstants', function () {
    it('returns an array with the constants key and json string value', function () {
        var data = { constants: { hello: { foo: 'bar' } } };
        var result = ngConstant.getConstants(data);
        expect(result[0]).toEqual({name: 'hello', value: '{"foo":"bar"}'});
    });

    it('extends the data.constants with the options.constants', function () {
        var data = { constants: { hello: 'andrew' } };
        var opts = { constants: { hello: 'world' } };
        var result = ngConstant.getConstants(data, opts);
        expect(result[0]).toEqual({ name: 'hello', value: '"world"' });
    });

    it('uses the data object if data.constants is not available', function () {
        var data = { hello: 'andrew' };
        var result = ngConstant.getConstants(data);
        expect(result[0]).toEqual({ name: 'hello', value: '"andrew"' });
    });

    it('accepts a JSON string as constants from the options', function () {
        var opts = { constants: JSON.stringify({ hello: 'world' }) };
        var result = ngConstant.getConstants({}, opts);
        expect(result[0]).toEqual({ name: 'hello', value: '"world"' });
    });

    it('stringifies the value with the given option.space', function () {
        var data = { constants: { hello: { foo: 'bar' } } };
        var result = ngConstant.getConstants(data, { space: '' });
        expect(result[0].value).toEqual('{"foo":"bar"}');
        result = ngConstant.getConstants(data, { space: ' ' });
        expect(result[0].value).toEqual('{\n "foo": "bar"\n}');
    });
});

describe('ngConstant.getFilePath', function() {
    it('returns the file path from the src plugin when option dest is undefined', function() {
        expect(ngConstant.getFilePath('/foo/bar/config.json', {})).toBe('/foo/bar/config.js');
    });

    it('returns the file path defined by the dest option', function() {
        expect(ngConstant.getFilePath('/foo/bar/foo.js', { dest: 'foo.js' })).toBe('/foo/bar/foo.js');
    });
});

function getStream(fileOptions) {
    var defaults = {path: 'constants.json'};
    var file = new gutil.File(_.merge(defaults, fileOptions));
    var stream = through.obj(gutil.noop());
    stream.end(file);
    return stream;
}

function evalNgConstant(options, callback) {
    var defaults = {stream: true, constants: {greeting: 'hello' }};
    ngConstant(_.merge(defaults, options)).on('data', function (file) {
        callback(file, file.contents.toString());
    });
}
