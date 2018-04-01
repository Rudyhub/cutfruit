const ready = require('./ready');
const info = require('./info');
const app = require('./app');

var img,
    gameover;
function create(){
    info.status = 'over';
    img = new PIXI.Sprite(ready.source.texture['game-over']);

    var w = info.winw > 768 ? 420 : info.winw/2,
        h = w * .55;

    img.anchor.x = img.anchor.y = 0.5;
    img.x = info.winw/2;
    img.y = info.winh/2;
    img.width = img.height = 0;

    //modify score
    if(info.score > info.best){
        window.localStorage.setItem(info.gameID, info.score);
        info.best = info.score;
        info.update('best');
    }
    try{
        app.stage.removeChild(img);
    }catch (err){}

    app.stage.addChild(img);
    img.visible = true;

    app.animate(img, {width: w, height: h}, function(){
        img.on('pointerdown',downFn);
        img.interactive = true;
    });
}
function downFn(){
    img.off('pointerdown',downFn);
    img.interactive = false;
    app.animate(img,{width: 0, height: 0}, function(){
        img.visible = false;
        destroy();
        if(gameover.onclickend) gameover.onclickend();
    });
}

function destroy(){
    img.destroy();
}
gameover = {
    create: create,
    destroy: destroy,
    onclickend: null
};
module.exports = gameover;