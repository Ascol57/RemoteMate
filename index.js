const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const fs = require('fs')
const app = express()
const port = process.env.PORT || 3000

// Proxy pour toutes les requêtes /plugins vers localhost:8181
/** @type {import('http-proxy-middleware/dist/types').RequestHandler<express.Request, express.Response>} */
const pluginsProxy = createProxyMiddleware({
  target: 'http://localhost:8181/plugins', // target host avec le même chemin de base
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.originalUrl} to http://localhost:8181${req.originalUrl}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
});

app.use('/plugins', pluginsProxy);

app.use(express.static('./'))

app.get('/', (req, res) => {
  fs.readFile('index.html', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error loading index.html');
      return;
    }
    const channel = process.env.TWITCH_CHANNEL || 'moonligopsone';
    const result = data.replace('{{channel}}', channel);
    res.send(result);
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

if (process.env.NGROK_ENABLED === 'true') {
  const ngrok = require('@ngrok/ngrok');

  (async function () {
    const listener = await ngrok.forward({
      addr: port,
      authtoken: process.env.NGROK_AUTH_TOKEN,
      domain: process.env.NGROK_DOMAIN,
    });

    // Output ngrok url to console
    console.log(`Ingress established at ${listener.url()}`);
  })();
}