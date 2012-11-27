/**
 * uTetris Test Suite
 *
 * @author Jose Luis Quintana <joseluis@lbn.pe>
 **/

window.addEvent('domready', function(){
    var tetris = new uTetris($('container'), $('preview'),{
        keypress: true
    });
    
    var play = $("play"), 
    score = $("score"), 
    level = $("level"), 
    lines = $("lines");
    
    tetris.addEvents({
        "start": function(e){
            setInfo(e);
            setPause();
        },
        "lines": setInfo,
        "fixed": setInfo,
        "pause": setPause,
        "gameover": function(){
            play.set("html", "Play");
        }
    });
    
    function setLabel(str) {
        play.set("html", str);
    }
    
    function setInfo(obj) {
        level.set("html", "Level: " + obj.level || 0);
        score.set("html", "Score: " + obj.score || 0);
        lines.set("html", "Lines: " + obj.lines || 0);
    }
    
    function setPause(pause) {
        setLabel(pause ? "Resume" : "Pause");
    }
    
    play.addEvent("click",function() {
        if (this.isStop()) {
            this.restart();
        } else {
            this.pause();
        }
    }.bind(tetris));
});