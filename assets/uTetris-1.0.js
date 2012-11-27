/*
---

name: uTetris
description: uTetris base Class
license: MIT-Style License <http://www.lbnstudio.fr/license.txt>
copyright: Jose Luis Quintana <http://www.lbnstudio.fr/>
authors: Jose Luis Quintana <joseluisquintana20@gmail.com>
requires: 
  - Core: 1.4/*
provides: uTetris
 
...
*/

window.uTetris = new Class({
    version: '1.0',
    
    Implements: [Events, Options],
    
    container: null,
    preview: null,
    form: null,
    nForm: -1,
    retade: null,
    timeout: 100,
    
    _gameover: false,
    _win: false,
    _pause: false,
    _stop: true,
    _running: false,
    _isdown: false,
    
    score: 0,
    level: 0,
    lines: 0,
    lines_values: [40, 100, 600, 3600],
    current_line: 0,
    brickclass: '',
    brickclass_preview: '',
    first_step: true,
    
    options: {
        auto: false,
        keypress: false,
        speed: 800,
        speed_reduction: 100,
        score_increase: 200,
        score_top: 1000000,
        number_lines: 10,
        aX: 10,
        aY: 15,
        box_width: "20px",
        box_height: "20px",
        lines_animation: {
            base_class: "animate",
            out_class: "out",
            duration: 1
        },
        brick_classes: [{
            name:'cube'
        },{
            name:'bar'
        },{
            name:'zleft'
        },{
            name:'t'
        },{
            name:'zright'
        },{
            name:'lright'
        },{
            name:'lleft'
        }]
    },
    initialize: function(container, preview, options) {
        this.container = container;
        this.preview = preview;
        this.setOptions(options);
        this.buildStructure();
        
        if (this.options.auto) {
            this.start();
        }
    },
    buildStructure: function() {
        this.buildStage();
        this.buildPreview();
    },
    buildStage: function() {
        var tr,y,n;
        
        for (y = 0; y <= (this.options.aY-1); y++) {
            tr = new Element("<tr/>");
            tr.set('tween', {
                duration: 'long'
            });
            
            for (n = 0; n <= this.options.aX-1; n++) {
                this.getBox().inject(tr);
            }
            
            tr.inject(this.container);
        }
    },
    buildPreview: function() {
        var tr,y,n;
        
        for(y = 0; y <= 3; y++) {
            tr = new Element("<tr/>");
            
            for(n = 0; n <= 3; n++){
                this.getBox().inject(tr);
            }
            
            tr.inject(this.preview);
        }
    },
    setEvents: function() {
        if (this.options.keypress) {
            document.addEvent('keydown', this.keydown.bind(this));
        }
    },
    unsetEvents: function() {
        if (this.options.keypress) {
            document.removeEvents('keydown');
        }
    },
    isPause: function() {
        return this._pause;
    },
    isStop: function() {
        return this._stop;
    },
    isGameover: function() {
        return this._gameover;
    },
    isRunning: function() {
        return this._running;
    },
    keydown: function(e) {
        if (!this._gameover) {
            switch(e.code) {
                case 13:
                case 19:
                    if (this._gameover) {
                        this.restart();
                    } else {
                        this.pause();
                    }
                    break;
                case 37:
                    this.left();
                    break;
                case 39:
                    this.right();
                    break;
                case 32:
                    this.rotate();
                    break;
                case 40:
                    this.down();
                    break;
            }
        }
        
        e.preventDefault();
    },
    start: function() {
        if (!this._running) {            
            this.unsetEvents();
            this.create();
            this.timeline(false);
            this.move = this._running = true;
            this._stop = this._win = this._lose = this._pause = this._gameover = false;
            this.score = this.lines = this.level = 0;
            this.setEvents();
            this.fireEvent("start", [{
                level: this.level, 
                score: this.score, 
                lines: this.lines
            }]);
        }
    },
    restart: function() {
        if (this._stop || this._gameover || this._win) {
            this.stop();
            this.start();
            this.fireEvent("restart");
        }
    },
    stop: function() {
        clearTimeout(this._timeout_id);
        this._pause = this._running = false;
        this._stop = true;
        
        for (this.y = 0; this.y <= (this.options.aY-1); this.y++) {
            this.deleteLine(this.y);
        }
        
        this.fireEvent("stop");
    },
    pause: function() {
        if (!this.isAnimate && !this._gameover && !this._win) {
            this._pause = !this._pause;
            this.init = this._pause;
            this._running = !this._pause;
            this.fireEvent("pause", this._pause);
        }
    },
    left: function() {
        if (!this.isAnimate && !this.isAnimate && !this._gameover && !this._pause && !this._win) {
            if (this.move && this.validForm(this.x-1, this.y, this.pos)) {
                this.del();
                this.x--;
                this.renderStage();
                this.fireEvent("leftmove");
            }
        }
    },
    right: function() {
        if (!this.isAnimate && !this._gameover && !this._pause && !this._win) {
            if(this.move && this.validForm((this.x+1), this.y, this.pos)){
                this.del();
                this.x++;
                this.renderStage();
                this.fireEvent("rightmove");
            }
        }
    },
    down: function() {
        if (!this.isAnimate && !this._gameover && !this._pause && !this._win) {
            if (this.move) {
                this._isdown = true;
                
                if (this.validForm(this.x, (this.y+1), this.pos)) {
                    this.del(true);
                    this.y++;
                    this.renderStage();
                }
                
                this._isdown = false;
            }
        }
    },
    rotate: function() {
        if (!this.isAnimate && !this._gameover && !this._pause && !this._win) {
            if (this.move) {
                this.rePos();
                this.fireEvent("rotate");
            }
        }
    },
    getBox: function() {
        return new Element("td",{
            "width" : this.options.box_width,
            "height" : this.options.box_height,
            "border-width": 1
        });
    },
    timeline: function(del) {
        if (!this.isAnimate) {
            if (this._pause || this._stop) {
                this.stopTimeline();
            } else {
                if (this.validForm(this.x, (this.y+1), this.pos)) {                
                    this.startTimeline(del);
                
                    if (this.first_step) {
                        this.first_step = false;
                        this.fireEvent("create", [this.brickclass, this.brickclass_preview]);
                    }
                } else {
                    this.resetBricks(del);
                }
            }
        }
    },
    startTimeline: function(del) {
        if (del) {
            this.del();
        }
        
        this.y++;
        this.renderStage();
        
        this._timeout_id = setTimeout(function(){
            this.timeline(true);
        }.bind(this), this.options.speed - (this.level * this.options.speed_reduction));
    },
    stopTimeline: function() {
        this._timeout_id = setTimeout(function(){
            if (this.init) {
                this.y--;
                this.init = false;
            }
                
            this.timeline();
        }.bind(this), this.timeout);
    },
    resetBricks: function(del) {
        if(del) {
            this.fix();
            this.checkLines();
            this.create();
            this.timeline(false);
            this.move = true;
        } else {
            this._gameover = this._stop = true;
            this._running = false;
            this.fireEvent("gameover", [{
                level: this.level, 
                score: this.score, 
                lines: this.lines
            }]);
        }  
    },
    create: function() {
        this.current_line = 0;
        this.x = Math.round((this.options.aX-1) / 2) -1;
        this.y = 0;
        this.form = this.nForm;
        
        if (this.nForm == -1) {
            this.form = this.interv();
        }
        
        this.pos = this.forms[this.form][0];
        this.retade = 1;
        
        this.nForm = this.interv();
        this.first_step = true;
    },
    interv: function() {
        return parseInt(Math.random() * this.forms.length);
    },
    forms: new Array(
        new Array(
            Array(Array(0,1,0,1),  Array(0,0,1,1))
            ),
        new Array(
            Array(Array(-1,0,1,2), Array(0,0,0,0)),
            Array(Array(0,0,0,0), Array(-1,0,1,2))
            ),
        new Array(
            Array(Array(-1,0,0,1), Array(0,0,1,1)),
            Array(Array(0,0,1,1), Array(1,0,0,-1))
            ),
        new Array(
            Array(Array(-1,0,1,0), Array(0,0,0,1)),
            Array(Array(0,0,0,1),  Array(1,0,-1,0)),
            Array(Array(-1,0,1,0), Array(0,0,0,-1)),
            Array(Array(0,0,0,-1), Array(1,0,-1,0))
            ),
        new Array(
            Array(Array(1,0,-1,0), Array(0,0,1,1)),
            Array(Array(-1,-1,0,0), Array(-1,0,0,1))
            ),
        new Array(
            Array(Array(0,0,0,1),  Array(-1,0,1,1)),
            Array(Array(-1,0,1,1), Array(0,0,0,-1)),
            Array(Array(0,0,0,-1), Array(1,0,-1,-1)),
            Array(Array(-1,0,1,-1), Array(-1,-1,-1,0))
            ),
        new Array(
            Array(Array(0,0,0,-1), Array(-1,0,1,1)),
            Array(Array(-1,0,1,1), Array(0,0,0,1)),
            Array(Array(0,0,0,1), Array(-1,0,1,-1)),
            Array(Array(-1,-1,0,1), Array(-1,0,0,0))
            )
        ),
    renderStage: function() {
        var n = 0;
        this.brickclass = this.options.brick_classes[this.form].name;
        
        for (; n <= 3; n++) {
            this.getStageBrick(this.x + this.pos[0][n], this.y + this.pos[1][n]).addClass(this.brickclass);
        }
        
        this.lY = this.y;
        this.lX = this.x;
                        
        if (!this.validForm(this.x, (this.y + (this._isdown ? 2 : 1)), this.pos)) {
            this.score += this.current_lines;
        }
        
        this.renderPreview();
    },
    renderPreview: function() {
        var n = 0;
        this.brickclass_preview = this.options.brick_classes[this.nForm].name;

        this.preview.getElements("td").each(function(td){
            td.set('class','');
        }.bind(this));
        
        for (n = 0; n <= 3; n++) {
            this.getPreviewBrick(1 + this.forms[this.nForm][0][0][n], 1 + this.forms[this.nForm][0][1][n]).addClass(this.brickclass_preview);
        }
    },
    getPreviewBrick: function(x,y) {
        return this.preview.getElement("tr:nth-child("+(y+1)+") td:nth-child("+(x+1)+")");
    },
    getStageBrick: function(x,y) {
        return this.container.getElement("tr:nth-child("+(y+1)+") td:nth-child("+(x+1)+")");
    },
    rePos: function() {
        if (this.forms[this.form][this.retade]) {
            if (this.validForm(this.x, this.y, this.forms[this.form][this.retade])) {
                this.del();
                this.pos = this.forms[this.form][this.retade];
                this.renderStage();
                this.retade++;
            }
        } else {
            if (this.validForm(this.x, this.y, this.forms[this.form][0])) {
                this.del();
                this.pos = this.forms[this.form][0];
                this.renderStage();
            }
            
            this.retade = 1;
        }
    },
    validForm: function(x, y, form) {
        for (var n = 0; n <= 3; n++) {
            if (!this.isValid(x + form[0][n], y + form[1][n])) {
                return false;
            }
        }
        
        return true;
    },
    del: function(down) {
        this.current_lines = down ? this.current_lines + 1 : 0;
        
        for (var n = 0; n <= 3; n++) {
            this.getStageBrick(this.lX + this.pos[0][n], this.lY + this.pos[1][n]).set('class','');
        }
    },
    isValid: function(x, y){
        if (y > (this.options.aY-1) || x > (this.options.aX-1) || x < 0 || y < 0 || this.isUsed(x, y)) {
            return false;
        }
        
        return true;
    },
    fix: function() {
        for (var n = 0; n <= 3; n++) {
            this.getStageBrick(this.x + this.pos[0][n], this.y + this.pos[1][n]).set("abbr","1");
        }
    },
    isUsed: function(x, y) {
        return this.getStageBrick(x,y).get("abbr") == "1";
    },
    isLine: function(y) {
        for (var x = 0; x <= (this.options.aX-1); x++) {
            if (!this.isUsed(x,y)) {
                return false;
            }
        }
        
        return true;
    },
    checkLines: function() {
        var lines = [];
        
        for (var i = 0; i < this.options.aY; i++) {
            if (this.isLine(i)) {
                lines.push({
                    i: i,
                    e: this.container.getElement("tr:nth-child("+(i+1)+")").addClass(this.options.lines_animation.base_class)
                });
            }
        }           
        
        if (lines.length > 0) {
            this.isAnimate = true;
            this.animateLines(lines);
        }
        
        this.fireEvent('fixed', {
            level: this.level, 
            score: this.score, 
            lines: this.lines
        });
    },
    animateLines: function(lines) {
        var sec = 3, levelup = false, i;
        
        for (i = 0; i < sec; i++) {
            (function(i){
                lines.each(function(el) {
                    if (i % 2 == 0) {
                        el.e.addClass(this.options.lines_animation.out_class);
                    } else {
                        el.e.removeClass(this.options.lines_animation.out_class);
                    }
                }.bind(this));
            }.bind(this, i)).delay(i * (1000 * this.options.lines_animation.duration));
        }
        
        (function(){
            lines.each(function(el) {
                el.e.removeClass(this.options.lines_animation.base_class);
                this.deleteLine(el.i);
                this.relocate(el.i);
                
                this.lines++;
                
                if (this.lines % this.options.number_lines == 0) {
                    this.level += 1;
                    levelup = true;
                }
            }.bind(this));
            
            var line = this.lines_values[lines.length-1];
            this.score += (this.level * line) + line;
            this.fireEvent("lines", [{
                length: lines.length,
                level: this.level, 
                score: this.score, 
                lines: this.lines
            }]);
            
            if (levelup) {
                this.fireEvent("levelup", [{
                    level: this.level, 
                    lines: this.lines
                }]);
            }
            
            if (this.score >= this.options.score_top) {
                clearTimeout(this._timeout_id);
                this._win = true;
                this.stop();
                this.fireEvent("win", [{
                    level: this.level, 
                    score: this.score, 
                    lines: this.lines
                }]);
            }
            
            this.isAnimate = false;
            this.timeline();
        }.bind(this)).delay(sec * 1000);    
    },
    deleteLine: function(y) {
        for (var x = 0; x <= (this.options.aX-1); x++) {
            this.getStageBrick(x,y).set('class','').set('abbr','0');
        }
    },
    relocate: function(y) {
        for (; y >= 0; y--) {
            for (var x = (this.options.aX-1); x >= 0; x--) {
                if (this.isUsed(x, y)) {
                    var cls = this.getStageBrick(x,y).get('class');
                    this.getStageBrick(x,y).set('class','').set('abbr','0');
                    this.getStageBrick(x,y+1).set('abbr','1').addClass(cls);
                }
            }
        }
    }
});