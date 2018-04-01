const info = require('./info');
/**
 * App 继承 PIXI.Application
 */
class App extends PIXI.Application{
    constructor(options){
        super(options);
        this.timers = [];
    }

    /**
     * 帧计时器
     * @param fn 执行函数
     * @returns {Ticker|*}
     */
    timer(fn){
        var ticker = new PIXI.ticker.Ticker();
        ticker.add(fn);
        this.timers.push(ticker);
        return ticker;
    }

    /**
     * 清除帧计时器
     * @param ticker
     * @param fn
     */
    clearTimer(ticker,fn){
        try{
            ticker.stop();
            ticker.remove(fn);
            ticker.destroy();
        }catch (err){}

        this.timers.splice(0,1);
    }
    /**
     * animate （线性无缓动）动画
     * @param obj pixi对象
     * @param options 属性配置
     * @param fn 回调
     */
    animate(obj,options,fn){
        if(!obj || typeof options != 'object') return;
        var o0 = {
                width: obj.width,
                height: obj.height,
                alpha: obj.alpha,
                rotation: obj.rotation,
                scale: obj.scale,
                x: obj.x,
                y: obj.y
            },
            ot = {duration: 800},
            v = {};
        for(var k in options){
            if(typeof options[k] === 'number') ot[k] = options[k];
        }
        options = null;
        var dur = ot.duration;
        delete ot.duration;

        for( var k in ot){
            v[k] = (ot[k] - o0[k])/dur;
        }

        var t = 0,
            _this = this;

        var ticker = _this.timer(doanm);
        function doanm(){
            var delta = ticker.elapsedMS;

            for(var n in ot){
                obj[n] += v[n]*delta;
            }
            t += delta;

            if(t >= dur){
                _this.clearTimer(ticker, doanm);
                if(fn) fn();
            }
        }
        ticker.start();
        return ticker;
    }
    /**
     * motion x轴匀速、y轴匀加/减速、旋转等混合运动
     * @param obj pixi对象
     * @param Px0 x轴初位移
     * @param Pxt x轴末位移
     * @param Py0 y轴初位移
     * @param Pyt y轴末位移
     * @param Vy0 y轴初速度
     * @param T   消耗的时间 单位：ms
     * @param R   旋转速度 单位：弧度/帧
     * @param fn  回调
     */
    motion(obj, Px0, Pxt, Py0, Pyt, Vy0, T, R, fn) {
        //加速度推算： S = v0*t+1/2*a*t^2  ==> a = 2*(S-v0*t)/t^2 , S = pt-p0
        var _this = this,
            A = (2 * (Pyt - Py0 - Vy0 * T)) / (T * T),
            t = 0,
            Vx = (Pxt - Px0) / T;

        obj.y = Py0;
        obj.x = Px0;
        var ticker = _this.timer(domotion);
        function domotion() {
            var delta = ticker.elapsedMS;
            obj.x += delta * Vx;
            //公式：s = s2-s1; s1 = a*t1 + 1/2*a*t1^2; s2 = a*t2 + 1/2*a*t2^2; t2 = t1+delta; t1 = t;
            obj.y += Vy0*delta + t*A*delta + .5*A*delta*delta;
            obj.rotation += R;
            t += delta;
            if(t >= T){
                _this.clearTimer(ticker, domotion);
                if(fn) fn();
            }
        }
        ticker.start();
        return ticker;
    }
}

var app = new App({
    width: info.winw,
    height: info.winh,
    backgroundColor: 0x000000
});
module.exports = app;