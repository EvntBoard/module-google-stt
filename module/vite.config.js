import legacy from '@vitejs/plugin-legacy'

export default {
  server: {
    port: 5011
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  build: {
    outDir: "build",
  }
}