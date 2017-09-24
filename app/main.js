const info = require('./js/info');
const app = require('./js/app');
const ready = require('./js/ready');
const scene = require('./js/scene');
const role = require('./js/role');
const cut = require('./js/cut');
const gameover = require('./js/gameover');
require('./css/style.css');
document.body.appendChild(app.view);

ready.load(function(){
    var scene1, scene2;
    showScene1();
    function showScene1(){
        try{
            scene.destroy(0);
            clearRoles();
        }catch (err){}
        scene1 = scene.create(0);
        scene1.alpha = 0;
        app.stage.addChild(scene1);
        app.animate(scene1, {alpha:1}, function(){
            scene.button.on('pointerdown', showScene2);
            info.status = 'wait';
            info.reset();
            scene.showParticle();
            try{
                scene.destroy(1);
                app.clearTimer();
            }catch(err){}
        });
    }
    function showScene2(){
        try{
            scene.destroy(1);
        }catch (err){}
        scene.button.off('pointerdown', showScene2);
        scene2 = scene.create(1);
        scene2.alpha = 0;
        app.stage.addChild(scene2);
        app.animate(scene2, {alpha:1}, function(){
            scene.hideParticle();
            try{
                scene.destroy(0);
                clearRoles();
            }catch(err){}

            info.status = 'start';
            showRoles();
        });
    }

    function showRoles(){
        var roleContainer = role.create();
        app.stage.addChild(roleContainer);
        cut.create();
    }

    function clearRoles(){
        role.destroy();
        cut.destroy();
    }

    gameover.onclickend = function(){
        showScene1();
    };

    //针对ios，需要预播放一次
    document.addEventListener('touchstart',function onceplay(){
        document.removeEventListener('touchstart', onceplay, false);
        for(var k in ready.source.audio){
            ;(function(audio){
                audio.setAttribute('src','audio/test.mp3');
                audio.play();
            })(document.getElementById(k));
        }
    },false);
});
