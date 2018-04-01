const PIXI = require('./pixi.min');
const ready = require('./ready');
const app = require('./app');
const info = require('./info');
const gameover = require('./gameover');
const audio = require('./audio');

let back,
    textures,
    rolesContainer,
    selects,
    selectslen,
    throwticker,
    tickers = [],
    enablethrow = false;
/**
 * 创建角色（对象）
 * @param options 配置项
 *  name: 名称，默认保持与资源图片名相同
 *  texture: texture资源
 *  cutRadius: 可监听划切到的半径
 *  cuted: 是否已被切
 *  particleColor: 溅射的粒子的颜色
 *  x,y....对象的x,y等其他属性。
 */
function _role(options){
    let o = {
        name: '',
        texture: null,
        cutRadius: 0,
        cutted: false,
        particleColor: 0xff0000,
        x: 0,
        y: 0
    };
    if(typeof options === 'object'){
        for(let k in options) o[k] = options[k];
    }
    options = null;

    let role = new PIXI.Sprite();
    role.anchor.x = role.anchor.y = .5;
    for(let name in o){
        role[name] = o[name];
    }
    role.name = !o.name ? o.texture.textureCacheIds[0] : o.name;
    return role;
}

function _roles(names,colors){
    let container = new PIXI.Container(),
        texture;
    for(let i=0, len=names.length; i<len; i++){
        texture = textures[ names[i] ];
        //创建碎片材质texture对象
        let piece1, piece2, pieces = [];
        if(piece1 = textures[ names[i] + '-1' ]){
            pieces[0] = piece1;
        }
        if(piece2 = textures[ names[i] + '-2' ]){
            pieces[1] = piece2;
        }

        container.addChild(
            _role({
                texture: texture,
                cutRadius: texture.width/2,
                x: info.winw/2,
                y: info.winh + texture.height,
                pieces: pieces,
                particleColor: colors[i] ? parseInt((colors[i]+'').replace('#',''),16) : null
            })
        );
    }
    return container;
}

function throwup(sprite){
    let y0 = info.winh + sprite.height,
        x0 = Math.random()*(info.winw - 2*sprite.width) + sprite.width,
        xt = Math.random()*(info.winw - 2*sprite.width) + sprite.width,
        dr = Math.random()>0.5 ? 1 : -1,
        r = dr*(Math.random()*0.08 + 0.02),
        v0 = -(Math.random()*.1+info.winh/1200);

    sprite.rotation = 0;
    sprite.visible = true;
    sprite.cutted = false;
    audio('throw');
    let ticker = app.motion(sprite, x0, xt, y0, y0, v0, info.time, r, function(){
        onThrowupEnd(sprite);
    });
    tickers.push(ticker);
}

function onThrowupEnd(role){
    if(!role.cutted && role.name !== 'boom' && info.status === 'start'){
        if(info.life > 0){
            info.life--;
            info.update('life');
            showLose(role.x, info.winh/2);
        }else{
            app.clearTimer();
            destroy();
            gameover.create();
        }
    }
}

function showLose(x,y){
    let txt = new PIXI.Text('x',{
        fontSize: 36,
        fontWeight: 'bold',
        fill: ['#bb0000'],
        align: 'center'
    }),
    timer;
    txt.x = x;
    txt.y = y;
    app.stage.addChild(txt);
    timer = setTimeout(function(){
        clearTimeout(timer);
        app.stage.removeChild(txt);
        txt.destroy();
    },2000);
}

function randomSelect(len){
    let indexs = [],
        s;
    //不让冰冻者（最后一个）被选。
    for(let i=0; i<len-1; i++){
        indexs[i] = i;
    }
    indexs.sort(function(){
        return Math.random() > .5 ? 1 : -1;
    });
    s = indexs.slice(0, Math.floor(Math.random()*(info.max - info.min)) + info.min);
    //当选出的数量够多时，才有一定的概率出现冰冻者
    if(s.length >= info.max-2 && Math.random() < .3){
        s.push(len-1);
    }

    return s;
}
function create(){
    //冰冻者一定要放在最后一个。
    let names = ['apple', 'banana', 'basaha', 'peach', 'sandia', 'boom', 'apple', 'banana', 'basaha', 'peach', 'sandia', 'boom','icebanana'],
        colors = ['#d4ff00','#ffe337','#ff1e00','#ffd021','#ff0000','#ff0000','#d4ff00','#ffe337','#ff1e00','#ffd021','#ff0000','#ff0000','#a5fcff'],
        time = info.time;

    textures = ready.source.texture;
    selects = randomSelect(names.length);
    selectslen = selects.length;
    rolesContainer = _roles(names, colors);
    enablethrow = true;

    //定时抛出
    throwticker = app.timer(dothrow);
    function dothrow(){
        if(info.status === 'start' || info.status === 'wait'){
            time += throwticker.elapsedMS;
            if(time > info.time + Math.random()*1000+500 && enablethrow){
                selects = randomSelect(names.length);
                selectslen = selects.length;
                tickers.splice(0,tickers.length);
                for(let i=0; i<selectslen; i++) {
                    throwup(rolesContainer.children[selects[i]]);
                }
                if(back.onthrowup) back.onthrowup();
                time = 0;
            }

            if(!enablethrow) app.clearTimer(throwticker, dothrow);
        }
    }
    throwticker.start();
    return rolesContainer;
}

function destroy(){
    enablethrow = false;
    selects.splice(0, selectslen);
    try{
        rolesContainer.destroy();
    }catch (err){}
}

function getActiveRoles(){
    let tmp = [];
    for(let i=0; i<selectslen; i++) {
        tmp[i] = rolesContainer.children[selects[i]];
    }
    return tmp;
}

function getAllRoles(){
    return rolesContainer.children;
}

function freeze(){
    tickers.push(throwticker);
    for(let i=0, len=tickers.length; i<len; i++){
        tickers[i].stop();
        (function(t){
            let timer = setTimeout(function(){
                clearTimeout(timer);
                t.start();
                rolesContainer.alpha = 1;
            }, info.freezetime);
        })(tickers[i]);
    }
    //使半透明，表示冰冻
    rolesContainer.alpha = .5;
}

back = {
    onthrowup: null,
    activeRoles: getActiveRoles,
    allRoles: getAllRoles,
    freeze: freeze,
    create: create,
    destroy: destroy
};
module.exports = back;