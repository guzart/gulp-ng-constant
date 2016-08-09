var gulp = require('gulp');
var ngConstant = require('../index');

gulp.task('config', function () {
  gulp.src('./config.json')
    .pipe(ngConstant({
      name: 'my.module.config',
      deps: ['ngAnimate'],
      constants: { myPropCnt: 'hola!' },
      header: '\'use strict\';\n',
      indent: '  ',
      space: null,
      wrap: 'es6'
    }))
    // Writes config.js to dist/ folder
    .pipe(gulp.dest('.'));
});
