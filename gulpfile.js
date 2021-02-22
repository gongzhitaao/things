const $ = require('gulp');
const $changed = require('gulp-changed');
const $htmlmin = require('gulp-htmlmin');
const $plumber = require('gulp-plumber');
const $postcss = require('gulp-postcss');

const del = require('del');
const server = require('browser-sync').create();

$.task('build', $.series(clean, $.parallel(pages, styles, misc)));
$.task('default', $.series('build', $.parallel(serve, watch)));
$.task('publish', publish);

function clean() {
  return del(['build']);
}

function reload(done) {
  server.reload();
  done();
}

function watch() {
  $.watch(['src/**/index.html'], $.series(pages, reload));
  $.watch('src/**/*.css', $.series(styles, reload));
  $.watch(['src/**/img/*'], $.series(misc, reload));
}

function serve(done) {
  server.init({server: 'build'});
  done();
}

function pages() {
  return $.src(['src/**/index.html'])
    .pipe($changed('build'))
    .pipe($plumber())
    .pipe($htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      removeEmptyAttributes: true,
      minifyJS: true,
      minifyCSS: true}))
    .pipe($.dest('build'));
}

function styles() {
  return $.src(['src/**/*.css'])
      .pipe($changed('build'))
      .pipe($plumber())
      .pipe($postcss([
        require('postcss-import')({path: ['src/']}), require('precss'),
        require('cssnano')({
          autoprefixer: {browsers: ['last 2 version'], add: true},
          discardComments: {removeAll: true}
        })
      ]))
      .pipe($.dest('build'));
}

function misc() {
  return $.src('src/**/img/*').pipe($changed('build')).pipe($.dest('build'));
}

function publish() {
  return $.src('./build/**/*').pipe($.dest('docs/'));
}
