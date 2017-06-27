var gulp = require('gulp')
var sass = require('gulp-sass')
var fs = require("fs");
var pug = require('gulp-pug')
var pug2 = require('pug')
var watch = require('gulp-watch')
var gulpCopy = require('gulp-copy')
var fileinclude = require('gulp-file-include')
var through = require('through2');
gulp.task('html', function () {
  return watch('src/*.pug', {
      ignoreInitial: false,
    })
    .pipe(pug())
    .pipe(gulp.dest('build/html'))
})

function regen(){
  var finalJs = {}; // a object to store all
  console.log('re-generating the compiled js file...');
  var baseDir = 'src/tilets';
  fs.readdirSync(baseDir).forEach(function(a){
    var p = baseDir + '/' + a;
    if(fs.statSync(p).isDirectory()){
      // read it out
      if(fs.existsSync(p + '/tmpl.html')){
        var fn = pug2.compileFileClient(p + '/tmpl.html',{'name':a,inlineRuntimeFunctions:false});
        fn = fn.split('\\').join('\\\\').split('\"').join('\\"').split('\n').join('\\n');
        finalJs[a] = 'DP.g()[1]("' + a + '","' + fn + '");';
      }else console.log("missing " + a + "template html!");
    }});
  // find all
  var arr = [];
  for(var k in finalJs){
    arr.push(finalJs[k]);
  }
  fs.writeFileSync('src/_compiled.js',arr.join('\n'));
}

gulp.task('precompile', function () {
  return watch('src/tilets/*.pug', {
      ignoreInitial: false,
    })
    .pipe(through.obj(regen()))
})


gulp.task('copy-template', function () {
  return watch(['src/**/*.*','!src/**/*.pug','!src/tilets/*.*'], {
      ignoreInitial: false
    })
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('build/html'))
})


gulp.task('default', ['html','precompile', 'copy-template'])
