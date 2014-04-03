/**
 * scripts/main.js
 *
 * This is the starting point for your application.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

var app = require('./app.js');

document.addEventListener("deviceready", app, false);
// window.addEventListener("load", app, false);