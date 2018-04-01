const info = require('./info');
const app = require('./app');
const ready = require('./ready');
const scene = require('./scene');
const role = require('./role');
const cut = require('./cut');
const gameover = require('./gameover');

document.body.appendChild(app.view);

ready.load(function(){
    let scene1, scene2;
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
        let roleContainer = role.create();
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
        for(let k in ready.source.audio){
            (function(audio){
                audio.setAttribute('src','audio/test.mp3');
                audio.play();
            })(document.getElementById(k));
        }
    },false);
});
