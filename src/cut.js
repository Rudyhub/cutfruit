const PIXI = require('./pixi.min');
const ready = require('./ready');
const app = require('./app');
const info = require('./info');
const particle = require('./particle');
const gameover = require('./gameover');
const role = require('./role');
const audio = require('./audio');

let cutter,
    roles;

let lines, flag, graphics;
function drawline(points){
    let graphic = new PIXI.Graphics();
    graphic.clear();
    graphic.lineStyle(1,0xffffff);
    graphic.moveTo(points[0].x,points[0].y);
    for(let i=1,len=points.length; i<len; i++){
        graphic.lineTo(points[i].x, points[i].y);
    }
    app.stage.addChild(graphic);
    graphics.push(graphic);
    if(graphics.length > 1){
        let a = graphics.shift()
        app.stage.removeChild(a);
        a.destroy();
    }
}

function onstart(se){
    lines.push({
        x: se.data.global.x,
        y: se.data.global.y
    });
    flag = true;
    let ticker = app.timer(dostart);
    function dostart(){
        if(flag){
            drawline(lines);
            combine(lines[lines.length-1]);
        }else{
            app.clearTimer(ticker, dostart);
        }
    }
    ticker.start();

    app.stage.on('pointermove',onmove);
    app.stage.on('pointerup',onend);
    app.stage.on('pointerupoutside',onend);
    function onmove(me){
        lines.push({
            x: me.data.global.x,
            y: me.data.global.y
        });
        if(lines.length > 5){
            lines.splice(0,1);
        }
    }

    function onend(){
        flag = false;
        lines.splice(0,lines.length);
        for(let i=0,len=graphics.length; i<len; i++){
            app.stage.removeChild(graphics[i]);
        }
        app.stage.off('pointermove',onmove);
        app.stage.off('pointerup',onend);
        app.stage.off('pointerupoutside',onend);
    }
}

function combine(p){
    for(let n=0, len=roles.length; n<len; n++){
        if(Math.sqrt(Math.pow( roles[n].x-p.x, 2) + Math.pow(roles[n].y-p.y, 2)) < roles[n].cutRadius){
            if(roles[n].name === 'boom' && info.status === 'start'){
                boomgif(roles[n]);
                return;
            }
            cutted(roles[n]);
        }
    }
}
function boomgif(sprite){
    audio('boom');
    info.status = 'over';
    role.destroy();
    let boomexp = new PIXI.extras.AnimatedSprite( ready.source.gifjson.boom );
    boomexp.loop = false;
    boomexp.anchor.x = boomexp.anchor.y = .5;
    boomexp.x = sprite.x;
    boomexp.y = sprite.y;
    sprite.visible = false;
    boomexp.play();
    app.stage.addChild(boomexp);
    boomexp.onComplete = function(){
        boomexp.destroy();
        boomexp = null;
        gameover.create( ready.source.texture['game-over'] );
    }
}
function cutted(sprite) {
    if(sprite.name === 'boom') return;

    if (!sprite.cutted) {
        sprite.cutted = true;
        sprite.visible = false;
        apart(sprite);
        particle.create(sprite.x, sprite.y, 20, sprite.particleColor);
        switch (sprite.name){
            case info.freezename:
                audio('freeze');
                role.freeze();
            break;
            default: audio('cut');
        }
        if (info.status === 'start') {
            info.score++;
            info.update('score');
        }
    }
}
function apart(sprite) {
    if(sprite.pieces.length !== 2) return;
    let pieces = [new PIXI.Sprite(sprite.pieces[0]), new PIXI.Sprite(sprite.pieces[1])],
        len = pieces.length,
        i = 0,
        cos = Math.cos(sprite.rotation + Math.PI / 4),
        d;
    if (cos < 0) {
        d = [0, 1];
    } else if (cos > 0) {
        d = [1, 0];
    } else {
        let tmpd = Math.random() > 0.5 ? 0 : 1;
        d = [tmpd, tmpd];
    }

    for (; i < len; i++) {
        pieces[i].anchor.x = pieces[i].anchor.y = .5;
        pieces[i].width = sprite.width;
        pieces[i].height = sprite.height;
        pieces[i].x = sprite.x;
        pieces[i].y = sprite.y;
        pieces[i].rotation = sprite.rotation;
        pieces[i].visible = true;
        app.stage.addChild(pieces[i]);
    }

    let dr = Math.random() > 0.5 ? 1 : -1;
    app.motion(
        pieces[d[0]],
        sprite.x,
        Math.random() * sprite.x * 0.6,
        sprite.y,
        info.winh + pieces[d[0]].height,
        0,
        info.time / 2,
        dr * (Math.random() * 0.03 + 0.02)
    );
    app.motion(
        pieces[d[1]],
        sprite.x,
        Math.random() * (info.winw - sprite.x) * 0.6 + sprite.x,
        sprite.y,
        info.winh + pieces[d[1]].height,
        0,
        info.time / 2,
        -dr * (Math.random() * 0.03 + 0.02),
    );

    let time = 0;
    let ticker = app.timer(doapart);
    function doapart() {
        time += ticker.elapsedMS;
        if(time > info.time/2){
            for (i = 0; i < len; i++) {
                pieces[i].destroy();
            }
            app.clearTimer(ticker, doapart);
        }
    }
    ticker.start();
}

function create(){
    roles = role.activeRoles();
    role.onthrowup = function(){
        roles = role.activeRoles();
    };
    app.stage.interactive = true;
    app.stage.on('pointerdown',onstart);
    lines = [];
    flag = false;
    graphics = [];
}
function destroy(){
    app.stage.interactive = false;
    app.stage.off('pointerdown',onstart);
    lines.splice(0, lines.length);
    let i = 0,
        len = graphics.length;
    for(; i<len; i++){
        graphics[i].destroy();
    }
    graphics.splice(0, len);
}
cutter = {
    create: create,
    destroy: destroy
};

module.exports = cutter;