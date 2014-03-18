(function(States){
    BKGM.States = function(){
        this.current = "default";
        this.once    = false;
        this.states  = { default : [] };
        this.tasks   = {};
        // this.task    = new BKGM.Task();
    }
    BKGM.States.prototype = {
        state: function (name, tasks) {
            this.states[name] = tasks;
        },
        task: function (name, fn) {
            this.tasks[name] = fn;
        },
        taskOnce: function(name, fn) {
            var self = this;
            this.tasks[name] = function(arg) {
                self.once === false?fn(arg):null;
            }
        },
        run: function() {
            var tasks = this.states[this.current];
            var result, tresult;
            for (var i = 0, l = tasks.length; i < l; i++) {
                tresult = this.tasks[tasks[i]](result);
                if (typeof(tresult) !== "undefined") result = tresult;
            }
            if (typeof(tresult) === "undefined") this.once = true;
            else this.switch(tresult);
        },
        switch: function(state, runNow){
            this.once = false;
            this.current = state;
            if (runNow == true) self:run();
        }
    }
})();
(function(){
    BKGM.Task = function(name, fn){
        this.tasks[name] = fn;
    }
})();