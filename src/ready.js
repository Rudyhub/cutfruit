const PIXI = require('./pixi.min');
const app = require('./app');
const info = require('./info');

let back = {
    load: ready,
    source: null
};
/**
 * loadsource 加载资源
 * @param progress 加载进度时执行
 * @param complete 加载完成时执行
 */
function ready(complete){
    let source = {
            img: ['background.jpg','game-over.png',
                'score.png','shadow.png','start-btn.png','title.png',
                'apple.png','apple-1.png','apple-2.png','banana.png','banana-1.png','banana-2.png',
                'basaha.png','basaha-1.png','basaha-2.png','boom.png','peach.png','peach-1.png',
                'peach-2.png','sandia.png','sandia-1.png','sandia-2.png',
                'icebanana.png','icebanana-1.png','icebanana-2.png'
            ],
            audio:['boom','cut','freeze','throw'],
            gifjson: [
                ['boomgif.json','boom',26]
            ]
        },
        imgpath = 'static/img/',
        gifpath = 'static/gifjson/',
        audiopath = 'static/audio/',
        percent = new PIXI.Text('    0%    ', {
            fontFamily: 'microsoft yahei',
            fontSize: 20,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ff7a00'],
            stroke: '#f7ffee',
            strokeThickness: 5,
            align: 'center'
        });
        back.source = {
            texture: {},
            audio: {},
            gifjson: {
                boom: []
            }
        };
        percent.x = info.winw/2;
        percent.y = info.winh/2;
        percent.anchor.x = percent.anchor.y = .5;
    app.stage.addChild(percent);
    function loadimg(){
        let imgs = source.img,
            loaded = 0;
        for(let i=0,len = imgs.length; i<len; i++){
            (function(n,loader){
                let name = imgs[n].slice(0,imgs[n].lastIndexOf('.'));
                loader.add(name, imgpath + imgs[n]).load(function(that, source){
                    loaded++;
                    loader.destroy();
                    back.source.texture[ name ] = source[ name ].texture;
                    //loading
                    percent.text = 'Image '+ Math.round((loaded / len) * 100) + '%';
                    if(loaded >= len) {
                        imgs.splice(0,len);
                        imgs = null;
                        loadgif();
                    }
                });
            })(i, new PIXI.loaders.Loader());
        }
    }
    function loadgif(){
        let gif = source.gifjson,
            loaded = 0;
        for(let i=0, len=gif.length; i<len; i++){
            (function(n, loader){
                loader.add('spritesheet', gifpath + gif[n][0] ).load(function(){
                    loaded++;
                    loader.destroy();

                    for (let j = 0, jlen = gif[n][2]; j < jlen; j++) {
                        let texture = PIXI.Texture.fromFrame(gif[n][1] + (j+1) + '.png');
                        back.source.gifjson.boom.push(texture);
                    }
                    percent.text = 'Effect ' + Math.round((loaded / len) * 100) + '%';
                    if(loaded >= len){
                        gif.splice(0,len);
                        gif = null;
                        loadaudio();
                    }

                });
            })(i, new PIXI.loaders.Loader());
        }
    }
    function loadaudio(){
        let audios = source.audio,
            loaded = 0;
        for(let i=0,len=audios.length; i<len; i++){
            let audio = document.createElement('audio');
            audio.setAttribute('src',audiopath + audios[i] +'.mp3');
            audio.setAttribute('preload', 'true');
            audio.id = audios[i];
            document.body.appendChild(audio);

            loaded++;
            percent.text = 'Audio ' + Math.round((loaded / len) * 100) + '%';
            back.source.audio[ audios[i] ] = audiopath + audios[i] +'.mp3';

            if(loaded >= len){
                audios.splice(0,len);
                audios = null;
                app.animate(percent,{alpha: 0, duration: 1000},function(){
                    percent.destroy();
                });
                if(complete) complete();
            }
        }
    }
    loadimg();
}
module.exports = back;