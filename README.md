gulp-ng-constant
================

[![Build Status](https://travis-ci.org/guzart/gulp-ng-constant.svg)](https://travis-ci.org/guzart/gulp-ng-constant)

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

## Usage

### configuration in `gulpfile.js`

_**gulpfile.js**_

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

_**app/config.json**_

    {
      "myFirstCnt": true,
      "mySecondCnt": { "hello": "world" }
    }

_**dist/config.js**_ _(output)_

    define(["require", "exports"], function(require, exports) {
      return angular.module("my.module.config", ["ngAnimate"])
        .constant("myFirstCnt", true)
        .constant("mySecondCnt", { "hello": "world" })
        .constant("myPropCnt", "hola!");
    });

### configuration in `config.json`

_**gulpfile.js**_

    var ngConstant = require('gulp-ng-constant');

    gulp.task('config', function () {
      gulp.src('app/config.json')
        .pipe(ngConstant())
        // Writes config.js to dist/ folder
        .pipe(gulp.dest('dist'));
    });


_**app/config.json**_

    {
      "name": "my.module.config",
      "deps": ["ngAnimate"],
      "wrap": "commonjs",
      "constants": {
        "myFirstCnt": true,
        "mySecondCnt": { "hello": "world" }
      }
    }

_**dist/config.js**_ _(output)_

    module.exports = angular.module("my.module.config", ["ngAnimate"])
        .constant("myFirstCnt", true)
        .constant("mySecondCnt", { "hello": "world" })
        .constant("myPropCnt", "hola!");

### Options

#### options.name

Type: `string`  
Default: `undefined`  
Overrides: `json.name`  

The module name.
This property will override any `name` property defined in the input `json` file.

#### options.dest

Type: `string`  
Default: `undefined`
_optional_

The path where the generated constant module should be saved.

#### options.constants

Type: `Object | string`  
Default: `undefined`  
Exends/Overrides: `json.constants`  

Constants to defined in the module.
Can be a `JSON` string or an `Object`.
This property extends the one defined in the input `json` file. If there are
properties with the same name, this properties will override the ones from the
input `json` file.

#### options.deps

Type: `array<string>`  
Default: `[]`  
Overrides: `json.deps`  
_optional_

An array that specifies the default dependencies a module should have.
This property will override any `deps` property defined in the input `json` file.

#### options.wrap

Type: `boolean|string`  
Default: `false`  
Available: `['amd', 'commonjs']`  
_optional_

A boolean to active or deactive the automatic wrapping.
A string who will wrap the result of file, use the
`<%= __ngModule %>` variable to indicate where to put the generated
module content.
A string with 'amd' that wraps the module as an AMD module,
compatible with RequireJS

#### options.space

Type: `string`  
Default: `'\t'`  
_optional_

A string that defines how the JSON.stringify method will prettify your code.

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
