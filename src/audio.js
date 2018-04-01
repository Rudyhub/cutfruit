const ready = require('./ready');

let audios = {};

function getAudio(){
    for(let k in ready.source.audio){
        audios[k] = document.getElementById(k);
        audios[k].setAttribute('src',ready.source.audio[k]);
    }
}

function play(name){
    if(!audios[name]) getAudio();
    audios[name].currentTime = 0;
    audios[name].play();
}
module.exports = play;