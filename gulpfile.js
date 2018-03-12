const clean = require('gulp-clean');
const gulp = require('gulp');
const gutil = require("gulp-util");
const sass = require('gulp-sass');
const cssmin = require('gulp-cssmin');
const webpack = require('webpack');

// Clean
gulp.task('clean', function () {
    return gulp.src('dist', { read: false })
        .pipe(clean());
});

// Webpack
gulp.task('webpack:dev:client:vendor', function (callback) {     
    webpack(require('./config/webpack/dev/webpack.client.vendor'), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack:dev:client:vendor]", stats.toString({
            cached: false,
            children: false,
            chunkModules: false,
            chunkOrigins: false,
            chunks:false,
            modules:false,
            source:false,
            version:false,
            colors: true
        }));
        callback();
    });
});

gulp.task('webpack:dev:client', function (callback) {     
    webpack(require('./config/webpack/dev/webpack.client'), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack:dev:client]", stats.toString({
            cached: false,
            children: false,
            chunkModules: false,
            chunkOrigins: false,
            chunks:false,
            modules:false,
            source:false,
            version:false,
            colors: true
        }));
        callback();
    });
});

gulp.task('webpack:dev:module:view', function (callback) {     
    webpack(require('./config/webpack/dev/webpack.module.view'), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack:dev:module:view]", stats.toString({
            cached: false,
            children: false,
            chunkModules: false,
            chunkOrigins: false,
            chunks:false,
            modules:false,
            source:false,
            version:false,
            colors: true
        }));
        callback();
    });
});

gulp.task('webpack:dev:host:vendor', function (callback) {     
    webpack(require('./config/webpack/dev/webpack.host.vendor'), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack:dev:host:vendor]", stats.toString({
            cached: false,
            children: false,
            chunkModules: false,
            chunkOrigins: false,
            chunks:false,
            modules:false,
            source:false,
            version:false,
            colors: true
        }));
        callback();
    });
});

gulp.task('webpack:dev:host', function (callback) {     
    webpack(require('./config/webpack/dev/webpack.host'), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack:dev:host]", stats.toString({
            cached: false,
            children: false,
            chunkModules: false,
            chunkOrigins: false,
            chunks:false,
            modules:false,
            source:false,
            version:false,
            colors: true
        }));
        callback();
    });
});

gulp.task('webpack:prod:client:vendor', function (callback) {     
    webpack(require('./config/webpack/prod/webpack.client.vendor'), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack:prod:client:vendor]", stats.toString({
            colors: true
        }))
        callback();
    });
});

gulp.task('webpack:prod:client', function (callback) {     
    webpack(require('./config/webpack/prod/webpack.client'), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack:prod:client]", stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('webpack:prod:module:view', function (callback) {     
    webpack(require('./config/webpack/prod/webpack.module.view'), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack:prod:module:view]", stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('webpack:prod:host:vendor', function (callback) {     
    webpack(require('./config/webpack/prod/webpack.host.vendor'), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack:prod:host:vendor]", stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('webpack:prod:host', function (callback) {     
    webpack(require('./config/webpack/prod/webpack.host'), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack:prod:host]", stats.toString({
            colors: true
        }));
        callback();
    });
});


// Compile Sass
gulp.task('sass:dev:client', function() {
    return gulp.src('src/client/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist/client'));
});

gulp.task('sass:dev:module:view', function() {
    return gulp.src('src/module/view/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist/client/view'));
});

gulp.task('sass:dev', ['sass:dev:client', 'sass:dev:module:view']);

gulp.task('sass:prod:client', function() {
    return gulp.src('src/client/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(gulp.dest('dist/client'));
});

gulp.task('sass:prod:module:view', function() {
    return gulp.src('src/module/view/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(gulp.dest('dist/client/view'));
});

gulp.task('sass:prod', ['sass:prod:client', 'sass:prod:module:view']);


// Copy resources
gulp.task('copy:resource:animate', function () {
    return gulp.src('node_modules/animate.css/animate.min.css')
        .pipe(gulp.dest('dist/client/assets'));
});

gulp.task('copy:resource:katex:css', function () {
    return gulp.src('node_modules/katex/dist/katex.min.css')
        .pipe(gulp.dest('dist/client/assets'));        
});

gulp.task('copy:resource:katex:font', function () {
    return gulp.src('node_modules/katex/dist/fonts/*')
        .pipe(gulp.dest('dist/client/assets/fonts'));      
});

gulp.task('copy:resource:katex', ['copy:resource:katex:css', 'copy:resource:katex:font']);        


gulp.task('copy:resource:fontawsome', function () {
    return gulp.src('node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('dist/client/assets/fonts'));
});

gulp.task('copy:resource:images', function () {
    return gulp.src('src/client/assets/img/**/*')
        .pipe(gulp.dest('dist/client/assets/img'));
});

gulp.task('copy:resources', ['copy:resource:animate', 'copy:resource:katex', 'copy:resource:fontawsome', 'copy:resource:images']);

gulp.task('build:dev:client:vendor', ['copy:resources', 'webpack:dev:client:vendor']);
gulp.task('build:dev:host:vendor', ['webpack:dev:host:vendor']);

gulp.task('build:dev:client', ['build:dev:client:vendor', 'sass:dev'], function() {
    gulp.start('webpack:dev:client');
    gulp.start('webpack:dev:module:view');
});
gulp.task('build:dev:host', ['build:dev:host:vendor'], function() {
    gulp.start('webpack:dev:host');
});

gulp.task('build:dev', ['clean'], function () {
    gulp.start('build:dev:client');
    gulp.start('build:dev:host');
});

gulp.task('watch', ['build:dev'], function () {
    gulp.watch('src/client/**/*.scss', ['sass:dev:client'])    
    gulp.watch('src/client/**/*.js', ['webpack:dev:client'])
    gulp.watch('src/client/**/*.vue', ['webpack:dev:client'])
    gulp.watch('src/module/view/**/*.scss', ['sass:dev:module:view'])
    gulp.watch('src/module/view/**/*.js', ['webpack:dev:module:view'])
    gulp.watch('src/module/view/**/*.vue', ['webpack:dev:module:view'])    
    gulp.watch('src/host/**/*.ts', ['webpack:dev:host'])
});

gulp.task('build:prod:client:vendor', ['copy:resources', 'webpack:prod:client:vendor']);
gulp.task('build:prod:host:vendor', ['webpack:prod:host:vendor']);

gulp.task('build:prod:client', ['build:prod:client:vendor', 'sass:prod'], function() {
    gulp.start('webpack:prod:client');
    gulp.start('webpack:prod:module:view');
});
gulp.task('build:prod:host', ['build:prod:host:vendor'], function() {
    gulp.start('webpack:prod:host');
});

gulp.task('build:prod', ['clean'], function () {
    gulp.start('build:prod:client');
    gulp.start('build:prod:host');
});
