/* jshint latedef: false */
'use strict';

var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');

var _ = require('lodash');
var js2coffee = require('js2coffee');

var TEMPLATE_PATH = path.join(__dirname, 'tpls', 'constant.tpl.ejs');
var DEFAULT_WRAP_PATH = path.join(__dirname, 'tpls', 'default-wrapper.tpl.ejs');
var AMD_WRAP_PATH = path.join(__dirname, 'tpls', 'amd-wrapper.tpl.ejs');
var COMMONJS_WRAP_PATH = path.join(__dirname, 'tpls', 'commonjs-wrapper.tpl.ejs');
var defaultWrapper, amdWrapper, commonjsWrapper;

module.exports = ngConstantPlugin;

var defaults = {
    space: '\t',
    deps: [],
    wrap: false,
    coffee: false,
    templatePath: TEMPLATE_PATH
};

function ngConstantPlugin(opts) {

    var options = _.merge({}, defaults, opts);
    var template = readFile(options.templatePath);

    return through.obj(objectStream);

    function objectStream(file, enc, cb) {
        /* jshint validthis: true */

        var _this = this;

        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            _this.emit('error', pluginError('Streaming not supported'));
            return cb();
        }

        try {
            // Get constants or overrides
            var data = JSON.parse(file.contents);
            var constants = _.map(data.constants, function (value, name) {
                return {
                    name: name,
                    value: stringify(value, options.space)
                };
            });

            // Create the module string
            var result = _.template(template, {
                moduleName: data.name,
                deps: data.deps || options.deps,
                constants: constants
            });

            // Handle wrapping
            result = wrap(result, options);

            // Convert to coffeescript
            if (module.coffee) { result = js2coffee.build(result); }

            file.path = gutil.replaceExtension(file.path, '.js');
            file.contents = new Buffer(result);
            _this.push(file);
        } catch (err) {
            err.fileName = file.path;
            _this.emit('error', pluginError(err));
        }

        cb();
    }
}

function pluginError(msg) {
    return new gutil.PluginError('gulp-tslint-log', msg);
}

function wrap(input, options) {
    var wrapper = options.wrap || '<%= __ngModule %>';
    if (wrapper === true) {
        if (!defaultWrapper) { defaultWrapper = readFile(DEFAULT_WRAP_PATH); }
        wrapper = defaultWrapper;
    } else if (wrapper === 'amd') {
        if (!amdWrapper) { amdWrapper = readFile(AMD_WRAP_PATH); }
        wrapper = amdWrapper;
    } else if (wrapper === 'commonjs') {
        if (!commonjsWrapper) { commonjsWrapper = readFile(COMMONJS_WRAP_PATH); }
        wrapper = commonjsWrapper;
    }
    return _.template(wrapper, _.merge({ '__ngModule': input }, options));
}

function readFile(filepath) {
    return fs.readFileSync(filepath, 'utf8');
}

function stringify(value, space) {
    return _.isUndefined(value) ? 'undefined' : JSON.stringify(value, null, space);
}

