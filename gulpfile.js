const { src, dest, watch, series, parallel } = require('gulp')
const sass = require('gulp-sass')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const postcss = require('gulp-postcss')
const cssnano = require('cssnano')
const replace = require('gulp-replace')
const nunjucks = require('gulp-nunjucks')
const rename = require('gulp-rename')
const beautify = require('gulp-beautify')
const clean = require('gulp-clean')

// Clean task: empties the output folder ready for compiling
function cleanTask () {
  return src('output', { read: false })
    .pipe(clean())
};

// Sass task: compiles the application.scss file into style.css
function scssTask () {
  return src('src/assets/sass/application.scss')
    .pipe(sass())
    .pipe(postcss([cssnano()]))
    .pipe(rename('style.css'))
    .pipe(dest('output/css'))
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask () {
  return src(['src/assets/js/**/*.js'])
    .pipe(concat('application.js'))
    .pipe(uglify())
    .pipe(dest('output/js'))
}

// NJ task: compiles Nunjucks to HTML
function njTask () {
  return src('src/**/!(_)*.njk')
    .pipe(nunjucks.compile())
    .pipe(rename(function (path) {
      path.extname = '.html'
    }))
    .pipe(dest('output'))
}

// Copy images: Copies images from scr to output
function copyImgTask () {
  return src('src/assets/img/**/*')
    .pipe(dest('output/img'))
}

// Beautify task: make HTML beautiful
function beautifyHTML () {
  return src('output/**/*.html')
    .pipe(beautify.html(
      {
        indent_size: 2
      }
    ))
    .pipe(dest('output'))
}

// Cachebust
function cacheBustTask () {
  var cbString = new Date().getTime()
  return src(['output/**/*.html'])
    .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
    .pipe(dest('output'))
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask () {
  watch(
    [
      'src/assets/**/*.scss',
      'src/assets/js/**/*.js',
      'src/**/*.njk',
      'src/assets/img/**/*'
    ],
    { interval: 1000, usePolling: true }, // Makes docker work
    series(
      cleanTask,
      parallel(scssTask, jsTask, njTask),
      cacheBustTask,
      copyImgTask,
      beautifyHTML
    )
  )
}

const axepackage = require('gulp-axe-webdriver')

function axe () {
  var options = {
    saveOutputIn: 'allHtml.json',
    headless: false,
    showOnlyViolations: true,
    urls: ['output/**/*.html']
  }
  return axepackage(options)
}

exports.axe = parallel(
  axe
)

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
  cleanTask,
  parallel(scssTask, jsTask, njTask),
  cacheBustTask,
  copyImgTask,
  beautifyHTML,
  watchTask
)
