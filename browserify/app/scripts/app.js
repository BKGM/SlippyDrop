/**
 * scripts/app.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

var BKGM = require('./BKGM'),
	States = require('./BKGM/States'),
	random = require('./random');

console.log(require('should'));

module.exports = function(){

	require('./screenplay')();
	require('./commonTasks')();
   	require('./gameTasks')();

	require('./game').run();
}
