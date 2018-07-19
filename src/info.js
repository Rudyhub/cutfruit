/**
 * 游戏的配置项
 */
const ls = window.localStorage;
const ss = window.sessionStorage;
const info = {
    winw : window.innerWidth,
    winh : window.innerHeight,
    gameID : 'wwpgameID001',
    time: 4000,
    freezename: 'icebanana',
    freezetime: 2000,
    score: 0,
    life: 3,
    best: 0,
    max: 6,
    min: 1,
    scoreTxt: 'BEST  ',
    lifeTxt: 'LIVES  ',
    status: 'wait',
    update: null,
    reset: function(){
        this.score = 0;
        this.life = parseInt(ss.getItem(this.gameID));
    }
};

if(!ls.getItem(info.gameID)){
    ls.setItem(info.gameID,0);
}
info.best = ls.getItem(info.gameID);
ss.setItem(info.gameID, info.life);
module.exports = info;