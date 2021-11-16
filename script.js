import { EvntComWebSocket } from 'evntcom-js/dist/web';

const isDev = import.meta.env.MODE === 'development'

window.addEventListener('load', function () {
  let websocket = new EvntComWebSocket({
    host: isDev ? 'localhost' : window.location.hostname,
    port: isDev ? 5000 : window.location.port,
  })

  // on stt newEvent !

  websocket.connect();
})