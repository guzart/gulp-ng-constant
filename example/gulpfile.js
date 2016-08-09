var gulp = require('gulp');
var ngConstant = require('../index');

gulp.task('config', function () {
  gulp.src('./config.json')
    .pipe(ngConstant({
      name: 'my.module.config',
      deps: ['ngAnimate'],
      constants: { myPropCnt: 'hola!' },
      indent: '  ',
      space: null,
      wrap: 'commonjs',
      wrapHeader: '(function () {\n\'use strict\';\n',
      wrapFooter: '}())'
    }))
    // Writes config.js to dist/ folder
    .pipe(gulp.dest('.'));
});
