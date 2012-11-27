uTetris
========

Custom web version of famouse Tetris game.


How to use
----------

The js code :
        
        #js
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


The html code :

        #html
        <div id="main">
            <div id="left">
                <table id="container"></table>
            </div>

            <div id="right">
                <div id="info">
                    <div id="score">Score: 0</div>
                    <div id="level">Level: 0</div>
                    <div id="lines">Lines: 0</div>
                </div>

                <div>
                    <table id="preview"></table>
                </div>

                <div id="controls">
                    <a href="javascript:;" id="play">Start</a>
                </div>
            </div>
        </div>


Live Demo
-----------

* Tetris game live demo [here](http://goo.gl/l4hRG)


Screenshots
-----------
* Tetris Game ![Screenshot](http://www.lbnstudio.fr/labs/tetris/test/uTetris/tetris_screeshot.jpg)


Base Doc
-----------

Public Methods :
    
    * uTetris.isPause()
    * uTetris.isStop()
    * uTetris.isGameover()
    * uTetris.isRunning()
    
    * uTetris.start()
    * uTetris.restart()
    * uTetris.stop()
    * uTetris.left()
    * uTetris.right()
    * uTetris.down()
    * uTetris.rotate()
    * uTetris.pause()
    
Events :

  * start({level, score, lines})
  * restart
  * stop
  * pause([pause])
  * leftmove
  * rightmove
  * rotate
  * create([brickclass, brickclass_preview])
  * gameover({level, score, lines})
  * fixed({level, score, lines})
  * lines({length, level, score, lines})
  * levelup(level, lines)
  * win({level, score, lines})
