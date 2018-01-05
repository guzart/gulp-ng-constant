'use strict';

var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');
var Vinyl = require('vinyl');
var PluginError = require('plugin-error');
var replaceExtension = require('replace-ext');
var through = require('through2');

var _ = require('lodash');

var TEMPLATE_PATH = path.join(__dirname, 'tpls', 'constant.tpl.ejs');
var DEFAULT_WRAP_PATH = path.join(__dirname, 'tpls', 'default-wrapper.tpl.ejs');
var AMD_WRAP_PATH = path.join(__dirname, 'tpls', 'amd-wrapper.tpl.ejs');
var COMMONJS_WRAP_PATH = path.join(__dirname, 'tpls', 'commonjs-wrapper.tpl.ejs');
var ES6_WRAP_PATH = path.join(__dirname, 'tpls', 'es6-wrapper.tpl.ejs');
var defaultWrapper, amdWrapper, commonjsWrapper, es6Wrapper;

var defaults = {
  space: null,
  merge: false,
  deps: null,
  stream: false,
  wrap: 'es6',
  wrapHeader: null,
  wrapFooter: null,
  indent: '',
  template: undefined,
  templatePath: TEMPLATE_PATH
};

function ngConstantPlugin(opts) {

  var options = _.merge({}, defaults, opts);
  var template = options.template || readFile(options.templatePath);
  var stream = through.obj(objectStream);

  if (options.stream) {
    stream.end(new Vinyl({ path: (opts.name || 'ngConstants') + '.json' }));
  }

  return stream;

  function objectStream(file, enc, cb) {
    var _this = this;

    if (file.isStream()) {
      _this.emit('error', pluginError('Streaming not supported'));
      return cb();
    }

    try {
      var data = file.isNull() ? {} : yaml.safeLoad(file.contents);

      // Create the module string
      var result = _.template(template)({
        moduleName: getModuleName(data, options, file),
        deps:       getModuleDeps(data, options),
        constants:  getConstants(data, options),
        indent:     options.indent
      });

      // Handle wrapping
      if (!options.wrap) { options.wrap = data.wrap; }
      result = wrap(result, options);

      file.path = getFilePath(file.path);
      file.contents = new Buffer(result);
      _this.push(file);
    } catch (err) {
      err.fileName = file.path;
      _this.emit('error', pluginError(err));
    }

    cb();
  }
}

function getModuleName(data, options, file) {
  var name = options.name || data.name;
  if (!name) {
    var extension = path.extname(file.path);
    name = path.basename(file.path, extension);
  }

  return name;
}

function getModuleDeps(data, options) {
  if (options.deps === false || data.deps === false) {
    return false;
  }

  return options.deps || data.deps || [];
}

function getConstants(data, options) {
  var opts = options || {};
  if (typeof opts.constants === 'string') {
    opts.constants = JSON.parse(opts.constants);
  }

  var dataCnst = data.constants || data;
  var method = opts.merge ? 'merge' : 'extend';
  var input = _[method]({}, dataCnst, opts.constants);
  var constants =  _.map(input, function (value, name) {
    return {
      name: name,
      value: stringify(value, opts.space)
    };
  });

  return constants;
}

function getFilePath(filePath) {
  return replaceExtension(filePath, '.js');
}

function pluginError(msg) {
  return new PluginError('gulp-tslint-log', msg);
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
  } else if (wrapper === 'es6') {
    if (!es6Wrapper) { es6Wrapper = readFile(ES6_WRAP_PATH); }
    wrapper = es6Wrapper;
  }

  var locals = _.merge({ '__ngModule': input }, options);
  return _.template(wrapper)(locals);
}

function readFile(filepath) {
  return fs.readFileSync(filepath, 'utf8');
}

function stringify(value, space) {
  return _.isUndefined(value) ? 'undefined' : JSON.stringify(value, null, space);
}

_.extend(ngConstantPlugin, {
  getConstants: getConstants,
  getFilePath: getFilePath,
  wrap: wrap
});

module.exports = ngConstantPlugin;
