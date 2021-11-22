const type = "CLASSIC" //  CLASSIC / THROTTLE / QUEUE / QUEUE_LOCK / THROTTLE_LOCK

const locker = null // Only required for QUEUE_LOCK & THROTTLE_LOCK types

const conditions = {
  "module-google-stt-start": true
};

const CACHE_FILENAME = "/stt/data.json"

async function reaction(eventData) {

  let newData = file.read(CACHE_FILENAME)

  if (!newData) {
    newData = {
      words: [],
      lang: 'en-EN',
    }
    file.write(CACHE_FILENAME, JSON.stringify(newData,  0, 2))
  } else {
    newData = JSON.parse(newData)
  }

  newEvent('module-google-stt-init', newData)
}