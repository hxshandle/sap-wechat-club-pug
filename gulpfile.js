var gulp = require('gulp')
var sass = require('gulp-sass')
var fs = require("fs");
var gulpPug = require('gulp-pug')
var pug2 = require('pug')
var watch = require('gulp-watch')
var gulpCopy = require('gulp-copy')
var path = require('path')
var fileinclude = require('gulp-file-include')
var through = require('through2');

function regen() {
  var finalJs = {}; // a object to store all
  console.log('re-generating the compiled js file...');
  var baseDir = 'src/tilets';
  const TPL_NAME = 'tmpl.pug'
  fs.readdirSync(baseDir).forEach(function (a) {
    var sourcePath = baseDir + '/' + a;
    if (fs.statSync(sourcePath).isDirectory()) {
      // read it out
      if (fs.existsSync(`${sourcePath}/${TPL_NAME}`)) {
        var fn = pug2.compileFileClient(`${sourcePath}/${TPL_NAME}`, {
          'name': a,
          inlineRuntimeFunctions: false
        });
        fn = fn.split('\\').join('\\\\').split('\"').join('\\"').split('\n').join('\\n');
        finalJs[a] = 'DP.g()[1]("' + a + '","' + fn + '");';
      } else console.log("missing " + a + "template html!");
    }
  });
  // find all
  var arr = [];
  for (var k in finalJs) {
    arr.push(finalJs[k]);
  }
  fs.writeFileSync('src/_compiled.js', arr.join('\n'));
}

gulp.task('copy-template2', function () {
  return gulp.src(['src/**/*.*', '!src/**/*.pug', '!src/tilets/*.*'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('build/html'))
})

gulp.task('pug2html', function () {
  return gulp.src('src/**/*.*')
    .pipe(through.obj(regen()))
})

gulp.task('compileBase', function () {
  gulp.src('src/base.pug').pipe(gulpPug())
    .pipe(gulp.dest('build/html'))
})

gulp.task('watch', function () {
  gulp.watch(['src/**/*.pug', 'src/**/*.css'], {
    ignoreInitial: false
  }, ['pug2html', "copy-template2"]);
});


gulp.task('default', ['pug2html', "copy-template2", 'watch'])
