const PIXI = require('./pixi.min');
const app = require('./app');
function create(x,y,num,color) {
    let points = [],
        container = new PIXI.Container(),
        dur = 1000,
        time = 0;

    num = num || 12;
    color = color || 0xbb0000;

    container.name = 'particle';
    for(let i=0; i<num; i++){
        points[i] = new PIXI.Graphics();
        points[i].lineStyle(0);
        points[i].beginFill(color, Math.random()*.6+.4);
        points[i].drawCircle(x, y, Math.random()*3+2);
        points[i].endFill();

        let a = Math.random()*360;
        points[i].Vx = Math.sin(a*180/Math.PI)*Math.random()*12;
        points[i].Vy = Math.cos(a*180/Math.PI)*Math.random()*12;

        container.addChild(points[i]);
    }

    app.stage.addChild(container);

    let ticker = app.timer(doparticle);
    function doparticle(){
        time += ticker.elapsedMS;

        for (let i = 0; i < num; i++) {
            points[i].x += points[i].Vx;
            points[i].y += points[i].Vy;
            points[i].Vy += .4;
        }if(time >= dur) {
            container.destroy();
            app.clearTimer(ticker,doparticle);
        }
    }
    ticker.start();
}

function destroy(){
    let containers = app.stage.children,
        i=0,
        len = containers.length;
    for(; i<len; i++){
        if(containers[i].name === 'particle'){
            containers[i].destroy();
        }
    }
}

module.exports = {
    create: create,
    destroy: destroy
};