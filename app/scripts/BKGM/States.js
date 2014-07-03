var BKGM = require('./');

var States = function(){
    this.current  = "default";
    this.once     = false;
    this.switched = false;
    this.states   = { default : [] };
    this.updates  = {};
    this.draws    = {};
    this.lastTime = 0;
    this.steps    = 0;
    this.time     = 0;
}

var frameTime = 1000/60;

States.prototype = {
    state: function (name, tasks) {
        this.states[name] = tasks;
    },
    draw: function (name, fn) {
        this.draws[name] = fn;
    },
    update: function(name, fn) {
        this.updates[name] = fn;
    },
    taskOnce: function(name, fn) {
        var self = this;
        this.draws[name] = function() {
            self.once === false?fn(arguments):null;
            self.once === false?console.log(name):null;
        };
    },
    run: function() {
        this.time += +new Date() - this.lastTime;
        var time = this.time;
        this.lastTime = +new Date();

        this.switched = false;
        var tasks = this.states[this.current],
            updates = this.updates,
            draws = this.draws;

        while (time >= frameTime){
            for (var i = 0, l = tasks.length; i < l; i++) {
                var task = tasks[i];
                if (updates[task]) {
                    if (typeof task === "string") {
                        if (updates[task]) updates[task]();
                    } else if (typeof task.args === 'function') {
                        if (updates[task.name]) updates[task.name].apply(null, task.args() || []);
                    } else {
                        if (updates[task.name]) updates[task.name].apply(null, task.args || []);
                    }
                }
            }
            time -= frameTime;
        }
        this.time = time;

        for (var i = 0, l = tasks.length; i < l; i++) {
            var task = tasks[i];
            if (typeof task === "string") {
                if (draws[task]) draws[task]();
            } else if (typeof task.args === 'function') {
                if (draws[task.name]) draws[task.name].apply(null, task.args() || []);
            } else {
                if (draws[task.name]) draws[task.name].apply(null, task.args || []);
            }
        }
        if (!this.switched) {
            this.once = true;
        }
    },
    switch: function(state, runNow){
        this.once = false;
        this.switched = true;
        this.current = state;
        this.lastTime = +new Date();
        this.step = 0;
        this.time = 0;
        if (runNow) this.run();
    }
}

module.exports = States;