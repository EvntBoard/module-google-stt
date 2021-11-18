import { EvntComWebSocket } from 'evntcom-js/dist/web';
import debounce from 'lodash/debounce';
import { SpeechRec } from './SpeechRec'

const isDev = import.meta.env.MODE === 'development'

window.addEventListener('load', () => {
  let websocket = new EvntComWebSocket({
    host: isDev ? 'localhost' : window.location.hostname,
    port: isDev ? 5000 : parseInt(window.location.port, 10),
  })

  const debouncedEmit = debounce((string: string | undefined) => {
    console.log(string)
  }, 1000)

  let foo = new SpeechRec("FR-fr");
  foo.onResult = () => {
    debouncedEmit(foo.resultString); // log the result
  };
  foo.start(true, true);

  websocket.connect();
})