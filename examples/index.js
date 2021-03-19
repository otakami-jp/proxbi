'use strict'

const { Client } = require('./../src');
const client = new Client({
  anonyme: true,
  hostname: '0.0.0.0',
  port: 1337,
  protocol: 'http',
  production: false,
  credentialType: 'Basic',
  realmMsg: 'Connect you >:',
});

client.on('ready', (host, proxyIP, port, protocol) => {
  console.log(`Proxy listening at ${protocol}://${proxyIP}:${port}`);
});

let dataSend = 0;
let dataReceve = 0;

client.on('request', (user) => {
  dataSend += user.request.dataLength;
  dataReceve += user.response.dataLength;
  console.log('=============================');
  console.log(
    '[%s] %s (%s) -> %s | %s %s',
    user.type,
    user.request.method,
    user.request.httpVersion,
    user.request.url,
    user.request.status.code,
    user.request.status.message,
  );
  console.log(
    '[%s] %s (%s) <- %s | %s %s',
    user.type,
    user.response.method,
    user.response.httpVersion,
    user.response.url,
    user.response.status.code,
    user.response.status.message,
  );
  console.log('[->] %s octets', dataSend);
  console.log('[<-] %s octets', dataReceve);
});

// Disable proxy for Discord
client.setPac('./examples/custom-proxy.pac');

/**
 * request: [client] ---------------------> [proxy] ----(middleware)----> [web]
 * reponse: [client] <---(middleware)------ [proxy] <-------------------- [web]
 */
// Add cors                  // Use function for use `this`
client.setMiddleware('cors', function(req, res, next, datas, userData) {
  res.setHeader('Access-Control-Allow-Origin', `${req.protocol}://${req.host}`);
  next();
}, 'response');

client.setAuthorize(function(req, userData) {
  if (
    !userData.credential.token ||
    userData.credential.typeToken != 'Basic'
    ) return;

  const [username, password] = userData.credential.token.split(':');
  
  userData.custom['k'] = 'boomer';

  if (username == 'test' && password == 'test') return true;
  else return false;
});

client.createProxy();
