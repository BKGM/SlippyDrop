var States = function(){
    this.current  = "default";
    this.once     = false;
    this.switched = false;
    this.states   = { default : [] };
    this.tasks    = {};
}
States.prototype = {
    state: function (name, tasks) {
        this.states[name] = tasks;
    },
    task: function (name, fn) {
        this.tasks[name] = fn;
    },
    taskOnce: function(name, fn) {
        var self = this;
        this.tasks[name] = function() {
            self.once === false?fn(arguments):null;
        }
    },
    run: function() {
        this.switched = false;
        var tasks = this.states[this.current],
            Tasks = this.tasks;
        for (var i = 0, l = tasks.length; i < l; i++) {
            var task = tasks[i];
            if (typeof task === "string") {
                Tasks[task]();
            } else if (typeof task.args === 'function') {
                Tasks[task.name].apply(null, task.args() || []);
            } else {
                Tasks[task.name].apply(null, task.args || []);
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
        if (runNow) this.run();
    }
}

module.exports = States;