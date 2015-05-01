var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var through2 = require('through2');
var browserify = require('browserify');
var rimraf = require('rimraf');
var lwip = require('lwip');


gulp.task('build',[
    'build:webroot',
    'build:asset'
]);


gulp.task('build:webroot', function(){
    var htmlFilter = $.filter('./src/webroot/**/*.html');

    return gulp.src(['./src/webroot/**/*'])
        //.pipe(htmlFilter)
        //.pipe($.swig({
        //    defaults: {
        //        cache: false
        //    }
        //}))
        //.pipe(htmlFilter.restore())
        .pipe(gulp.dest('./build'));
});


gulp.task('build:asset', [
    'build:asset:javascript',
    'build:asset:scss',
    'build:asset:image',
    'build:asset:font'
]);


gulp.task('build:asset:javascript', function(){
    return gulp.src('./src/asset/javascript/site.js')
        .pipe(through2.obj(function (file, enc, next){
            browserify(file.path)
                .transform('debowerify')
                .transform('brfs')
                .transform('babelify')
                .bundle(function(err, res){
                    file.contents = res;
                    next(null, file);
                });
        }))
        .pipe(gulp.dest( './build/asset/javascript' ))
});


gulp.task('build:asset:scss', function(){
    return $.rubySass('./src/asset/scss/site.scss', {
        loadPath: [
            './src/asset/scss/',

            // allows loading of bower_components
            './bower_components/'
        ]
    }).pipe(gulp.dest('./build/asset/css'));
});

var createLwipStream = function(processFn){
    return through2.obj(function (file, enc, next){
        if (file.isNull()) {
            // return empty file
            next(null, file);
        } else {
            lwip.open(file.path, function(err, image){
                processFn(image, function(){
                    image.toBuffer('jpg', function(err, buffer){
                        file.contents = buffer;
                        next(null, file);
                    });
                });
            });
        }
    })
};

var createImageSizeContain = function(maxSize){
    return createLwipStream(function(image, callback){
        var width = image.width();
        var height = image.height();

        if (width <= maxSize && height <= maxSize) {
            callback();
        } else {
            if ( width > height ){
                image.resize(maxSize, (maxSize / width) * height, callback);
            } else {
                image.resize((maxSize / height) * width, maxSize, callback);
            }
        }
    })
}


gulp.task('build:asset:image', ['build:asset:image:object'], function(){
    return gulp.src([
            './src/asset/image/**/*',
            '!./src/asset/image/object/**/*'
        ])
        .pipe(createLwipStream(function(image, callback){
            image.contain(86,86, callback)
        }))
        .pipe(gulp.dest('./build/asset/image'));
});

gulp.task('build:asset:image:object', [
    'build:asset:image:object:thumbnail',
    'build:asset:image:object:preview',
    'build:asset:image:object:large'
]);

gulp.task('build:asset:image:object:thumbnail', function(){
    return gulp.src(['./src/asset/image/**/*'])
        .pipe(createImageSizeContain(83))
        .pipe($.rename({
            suffix: "-thumbnail"
        }))
        .pipe(gulp.dest('./build/asset/image'));
});

gulp.task('build:asset:image:object:preview', function(){
    return gulp.src(['./src/asset/image/**/*'])
        .pipe(createImageSizeContain(1600))
        .pipe($.rename({
            suffix: "-preview"
        }))
        .pipe(gulp.dest('./build/asset/image'));
});

gulp.task('build:asset:image:object:large', function(){
    return gulp.src(['./src/asset/image/**/*'])
        .pipe(createImageSizeContain(4000))
        .pipe($.rename({
            suffix: "-large"
        }))
        .pipe(gulp.dest('./build/asset/image'));
});

gulp.task('build:asset:font', function(){
    return gulp.src(['./src/asset/font/**/*'])
        .pipe(gulp.dest('./build/asset/font'));
});


gulp.task('build:live', ['preview'], function(){
    gulp.watch('./src/asset/javascript/**/*', ['build:asset:javascript']);
    gulp.watch('./src/asset/scss/**/*', ['build:asset:scss']);
    gulp.watch('./src/asset/image/**/*', ['build:asset:image']);
    gulp.watch('./src/asset/font/**/*', ['build:asset:font']);
    gulp.watch('./src/webroot/**/*', ['build:webroot']);
});



// Clean Output Directories
gulp.task('clean', function (cb) {
    rimraf('./build', function(){
        $.cache.clearAll(cb);
    });
});


gulp.task('preview', ['build'], function(){
    browserSync({
        server: {
            baseDir: 'build'
        },
        notify: false,
        tunnel: false,
        startPath: '/'
    });

    // when build folder changes content, reload browser
    // has a timeout of 60 ms preventing a reload overflow
    gulp.watch(['./build/**/*'], (function(){
        var cb;
        return function(){
            clearTimeout(cb);
            cb = setTimeout(function(){
                reload();
            }, 60);
        };
    })());
});


gulp.task('deploy', ['build'], function(){
    return gulp.src('./build/**/*')
        .pipe($.ghPages());
});
