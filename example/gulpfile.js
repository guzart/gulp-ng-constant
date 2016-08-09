var gulp = require('gulp');
var ngConstant = require('../index');

gulp.task('config', function () {
  gulp.src('./config.json')
    .pipe(ngConstant({
      name: 'my.module.config',
      deps: ['ngAnimate'],
      constants: { myPropCnt: 'hola!' },
      indent: '  ',
      wrap: 'es6'
    }))
    .pipe(gulp.dest('.'));
});
