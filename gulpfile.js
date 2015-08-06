var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');

gulp.task('styles', function(){
	return gulp.src('css/*.scss')
			.pipe(sass().on('error',sass.logError))
			.pipe(concat('style.css'))
			.pipe(gulp.dest('css/'));
});




gulp.task('watch', function() {
	gulp.watch('css/*.scss', ['styles']);
});

gulp.task('default', ['watch']);