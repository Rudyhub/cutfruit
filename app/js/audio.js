const ready = require('./ready');

var audios = {};

function getAudio(){
    for(var k in ready.source.audio){
        audios[k] = document.getElementById(k);
    }
}

function play(name){
    if(!audios[name]) getAudio();
    audios[name].currentTime = 0;
    audios[name].play();
}
module.exports = play;