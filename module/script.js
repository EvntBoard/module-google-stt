import { EvntCom } from 'evntcom-js';
import deburr from 'lodash/deburr';
import toLower from 'lodash/toLower';

const clean = (str) => toLower(deburr(str))

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

const isDev = import.meta.env.MODE === 'development'

let magic_word = [];
let lang = 'en-EN'

window.addEventListener('load', function () {
  let websocket = new EvntCom({
    host: isDev ? 'localhost' : window.location.hostname,
    port: isDev ? 5000 : window.location.port,
    events: ['module-google-stt-init']
  })

  websocket.on('open', (id) => {
    websocket.notify('newEvent', ['module-google-stt-start']);
  })

  websocket.on('event', ({ event }) => {
    if (event === 'module-google-stt-init') {
      magic_word = event.payload.words
      lang = event.payload.lang
    }
  })

// initialize our SpeechRecognition object
  let recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = true;

// detect the magic word
  recognition.onresult = e => {
    const transcripts  = [].concat.apply([], [...e.results].map(res => [...res].map(alt => alt.transcript)));

    console.debug(transcripts)

    const data = transcripts.reduce((acc, item) => {
      if (!acc) {
        acc = magic_word.find((j) => clean(item).includes(clean(j)))
      }
      return acc
    }, null)

    if(data){
      websocket.notify('newEvent', ['module-google-stt', { word: data }]);
      recognition.stop();
    }
  }

// called when we detect silence
  function stopSpeech(){
    recognition.stop();
    // console.log('inactive');
  }

// called when we detect sound
  function startSpeech(){
    try{ // calling it twice will throw...
      recognition.start();
    }
    catch(e){}
    // console.log('active');
  }

// request a LocalMediaStream
  navigator.mediaDevices.getUserMedia({audio:true})
    // add our listeners
    .then(stream => detectSilence(stream, stopSpeech, startSpeech))
    .catch(e => console.log(e.message));

  function detectSilence(
    stream,
    onSoundEnd = _=>{},
    onSoundStart = _=>{},
    silence_delay = 500,
    min_decibels = -80
  ) {
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    const streamNode = ctx.createMediaStreamSource(stream);
    streamNode.connect(analyser);
    analyser.minDecibels = min_decibels;

    const data = new Uint8Array(analyser.frequencyBinCount); // will hold our data
    let silence_start = performance.now();
    let triggered = false; // trigger only once per silence event

    function loop(time) {
      requestAnimationFrame(loop); // we'll loop every 60th of a second to check
      analyser.getByteFrequencyData(data); // get current data
      if (data.some(v => v)) { // if there is data above the given db limit
        if(triggered){
          triggered = false;
          onSoundStart();
        }
        silence_start = time; // set it to now
      }
      if (!triggered && time - silence_start > silence_delay) {
        onSoundEnd();
        triggered = true;
      }
    }
    loop();
  }

  websocket.connect();
})