const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const htmlmin = require("gulp-htmlmin");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const terser = require("gulp-terser");
const squoosh = require("gulp-libsquoosh");
const webP = require("gulp-webp");
const del = require("del");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer,
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// HTML

const html = () => {
  return gulp.src("source/*.html")
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));
}

exports.html = html;

// Scripts

const scripts = () => {
  return gulp.src("source/js/script.js")
  .pipe(terser())
  .pipe(rename("script.min.js"))
  .pipe(gulp.dest("build/js"))
}

exports.scripts = scripts;

// Images

const optimizeimages = () => {
  return gulp.src("source/img/**/*.{svg,png,jpg}")
  .pipe(gulp.dest("build/img"));
}

exports.optimizeimages = optimizeimages;

// copyImages

const copyImages = () => {
  return gulp.src("source/img/**/*.{svg,png,jpg}")
  .pipe(squoosh())
  .pipe(gulp.dest("build/img"));
}

exports.copyImages = copyImages;

// WebImages

const WebImages = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webP())
  .pipe(gulp.dest("build/img"));
}

exports.WebImages = WebImages;

// copy

const copy = (done) => {
  gulp.src ([
    "source/fonts/*.{woff,woff2}",
    "source/*.ico",
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"))
  done();
}

exports.copy = copy;

// clean

const clean = () => {
  return del("build")
}

exports.clean = clean;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

// build

const build = gulp.series(
  clean,
  copy,
  optimizeimages,
  gulp.parallel(
    styles,
    html,
    scripts,
    WebImages
  )
);

exports.build = build;

// default

exports.default = gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    WebImages
  ),
  gulp.series(
    server,
    watcher
  )
);
