gulp-ng-constant
================

[![License](http://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://npmjs.org/package/gulp-ng-constant)
[![NPM version](http://img.shields.io/npm/dm/gulp-ng-constant.svg?style=flat)](https://npmjs.org/package/gulp-ng-constant)
[![NPM version](http://img.shields.io/npm/v/gulp-ng-constant.svg?style=flat)](https://npmjs.org/package/gulp-ng-constant)  
[![Build Status](https://travis-ci.org/guzart/gulp-ng-constant.svg)](https://travis-ci.org/guzart/gulp-ng-constant)
[![Code Climate](https://codeclimate.com/github/guzart/gulp-ng-constant/badges/gpa.svg)](https://codeclimate.com/github/guzart/gulp-ng-constant)
[![Dependency Status](https://gemnasium.com/guzart/gulp-ng-constant.svg)](https://gemnasium.com/guzart/gulp-ng-constant)

## Information

<table>
<tr>
<td>Package</td><td>gulp-ng-constant</td>
</tr>
<tr>
<td>Description</td>
<td>Plugin for dynamic generation of angular constant modules.<br>
Based of <a href="https://github.com/werk85/grunt-ng-constant">grunt-ng-constant</a></td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.10</td>
</tr>
</table>

## Index

1. [Usage](#usage)
  * [Configuration in gulpfile.js](#configuration-in-gulpfilejs)
  * [Configuration in config.json](#configuration-in-configjson)
2. [Options](#options)
  * [name](#optionsname)
  * [stream](#optionsstream)
  * [constants](#optionsconstants)
  * [merge](#optionsmerge)
  * [deps](#optionsdeps)
  * [wrap](#optionswrap)
  * [wrapHeader](#optionswrapheader)
  * [wrapFooter](#optionswrapfooter)
  * [space](#optionsspace)
  * [template](#optionstemplate)
  * [templatePath](#optionstemplatepath)
  * [indent](#optionsindent)
3. [Examples](#examples)
  * [Multiple Environments](#multiple-environments)
  * [Stream](#stream)
  * [YAML](#yaml)
  * [ECMAScript 2015 (ES6)](#ecmascript-2015-es6)
4. [Special Thanks](#special-thanks)

## Usage

### Configuration in `gulpfile.js`

_**gulpfile.js**_

```javascript
var ngConstant = require('gulp-ng-constant');

gulp.task('config', function () {
  gulp.src('app/config.json')
    .pipe(ngConstant({
      name: 'my.module.config',
      deps: ['ngAnimate'],
      constants: { myPropCnt: 'hola!' },
      wrap: 'amd',
    }))
    // Writes config.js to dist/ folder
    .pipe(gulp.dest('dist'));
});
```

_**app/config.json**_
```json
{
  "myFirstCnt": true,
  "mySecondCnt": { "hello": "world" }
}
```

_**dist/config.js**_ _(output)_

```javascript
define(["require", "exports"], function(require, exports) {
  return angular.module("my.module.config", ["ngAnimate"])
    .constant("myFirstCnt", true)
    .constant("mySecondCnt", { "hello": "world" })
    .constant("myPropCnt", "hola!");
});
```

### Configuration in `config.json`

_**gulpfile.js**_

```javascript
var ngConstant = require('gulp-ng-constant');

gulp.task('config', function () {
  gulp.src('app/config.json')
    .pipe(ngConstant())
    // Writes config.js to dist/ folder
    .pipe(gulp.dest('dist'));
});
```


_**app/config.json**_

```json
{
  "name": "my.module.config",
  "deps": ["ngAnimate"],
  "wrap": "commonjs",
  "constants": {
    "myFirstCnt": true,
    "mySecondCnt": { "hello": "world" }
  }
}
```

_**dist/config.js**_ _(output)_

```javascript
module.exports = angular.module("my.module.config", ["ngAnimate"])
    .constant("myFirstCnt", true)
    .constant("mySecondCnt", { "hello": "world" })
    .constant("myPropCnt", "hola!");
```

## Options

#### options.name

Type: `string`  
Default: `filename` or `"ngConstants"`  
Overrides: `json.name`  
_optional_

The module name.
This property will override any `name` property defined in the input `json` file. The default name when used as a transform stream (i.e. regular plugin) is the passed file name. When [options.stream](#optionsstream) is `true` the default name is `"ngConstants"`.

#### options.stream

Type: `boolean`  
Default: `false`  
_optional_

If true it returns a new gulp stream, which can then be piped other gulp plugins
([Example](#stream)).

#### options.constants

Type: `Object | string`  
Default: `undefined`  
Extends/Overrides: `json.constants`  

Constants to defined in the module.
Can be a `JSON` string or an `Object`.
This property extends the one defined in the input `json` file. If there are
properties with the same name, this properties will override the ones from the
input `json` file.

#### options.merge

Type: `boolean`  
Default: `false`  
_optional_  

This applies to constants of the Object type.
If true the constants of type Object from the input file and the constants
from the configuration will be merged.

#### options.deps

Type: `array<string>|boolean`  
Default: `[]`  
Overrides: `json.deps`  
_optional_

An array that specifies the default dependencies a module should have. To add the constants to an existing module, you can set it to `false`.
This property will override any `deps` property defined in the input `json` file.

#### options.wrap

Type: `boolean|string`  
Default: `'es6'`  
Available: `[false, 'amd', 'commonjs', 'es6']`  
_optional_

A boolean to active or deactive the automatic wrapping.
A string who will wrap the result of file, use the
`<%= __ngModule %>` variable to indicate where to put the generated
module content.
A string with 'amd' that wraps the module as an AMD module,
compatible with RequireJS

#### options.wrapHeader

Type: `string`  
Default: `null`  
_optional_

A string that is prepended to the wrapper.

#### options.wrapFooter

Type: `string`  
Default: `null`  
_optional_

A string that is appended to the wrapper.

#### options.space

Type: `string`  
Default: `null`  
_optional_

A string that defines how the JSON.stringify method will prettify your code, e.g. `'\t'`, `' '`

#### options.template

Type: `string`  
Default: _content of [tpls/constant.tpl.ejs](https://github.com/guzart/gulp-ng-constant/blob/master/tpls/constant.tpl.ejs)_  
_optional_

EJS template to apply when creating the output configuration file. The following variables
are passed to the template during render:

  * `moduleName`: the module name (`string`)
  * `deps`: the module dependencies (`array<string>`)
  * `constants`: the module constants (`array<contantObj>`)
    * where a `constantObj` is an object with a `name` and a `value`, both `strings`.

#### options.templatePath

Type: `string`  
Default: `'tpls/constant.tpl.ejs'`  
_optional_

Location of a custom template file for creating the output configuration file. Defaults to the provided constants template file if none provided.

#### options.indent

Type: `string`  
Default: `''` (empty string)  
_optional_

A string that is used to indent the `.constant()` lines in the generated file. Useful only for
formatting the output file.

## Examples

### Multiple Environments

_**config.json**_
```json
{
  "development": { "greeting": "Sup!" },
  "production": { "greeting": "Hello" }
}
```

_**gulpfile.js**_
```javascript
var gulp = require('gulp');
var ngConstant = require('gulp-ng-constant');

gulp.task('constants', function () {
  var myConfig = require('./config.json');
  var envConfig = myConfig[process.env];
  return ngConstant({
      constants: envConfig,
      stream: true
    })
    .pipe(gulp.dest('dist'));
});

```

### Stream

```javascript
var gulp = require('gulp');
var ngConstant = require('gulp-ng-constant');
var uglify = require('gulp-uglify');

gulp.task('constants', function () {
  var constants = { hello: 'world' };
  return ngConstant({
      constants: constants,
      stream: true
    })
    .pipe(uglify())  
    .pipe(gulp.dest('dist'));
});
```

### YAML

Just write your configuration in a YAML file and pipe it to the plugin.

_**config.yml**_
```yaml
greeting: Merry Christmas!
seasons:
  - Winter
  - Spring
  - Summer
  - Fall
```

_**gulpfile.js**_
```javascript
var gulp = require('gulp');
var ngConstant = require('gulp-ng-constant');

gulp.task('constants', function () {
  gulp.src('app/config.yml')
    .pipe(ngConstant())
    .pipe(gulp.dest('dist'));
});
```

### ECMAScript 2015 (ES6)

_**envs.json**_
```json
{
  "development": {
    "ENV": {
        "KEY": "secret",
        "API_URL": "http://localhost/"
    }
  },
  "production": {
    "ENV": {
        "KEY": "superSecret",
        "API_URL": "http://example.com/"
    }
  }
}
```

_**gulpfile.babel.js**_
```javascript
import gulp     from 'gulp';
import rename   from 'gulp-rename';
import ngConstant from 'gulp-ng-constant';

gulp.task('constants', function () {
  var myConfig = require('./envs.json');
  var envConfig = myConfig[process.env];
  return ngConstant({
      name: "app.env",
      constants: envConfig,
      stream: true,
      wrap: "es6"
    })
    .pipe(rename('env.js'))
    .pipe(gulp.dest('dist'));
});

```

_**app.js**_
```javascript
'use strict';

import angular from 'angular';
import env from 'env';

let app = angular.module('app', [env.name])
    .factory('someRepository', function($http, ENV) {
        //Just to illustrate
        $http.get(ENV.API_URL);
    });


export default app;

```

## Special Thanks

@alexeygolev, @sabudaye, @ojacquemart, @lukehorvat, @rimian, @andidev, @dotDeeka, @LoicMahieu, @vladimirgamalian
