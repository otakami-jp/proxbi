'use strict';

/***/
function upgrade(request, socket, head) {
  socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
    'Proxy-agent: ' + this.proxyAgent + '\r\n' +
    'Upgrade: WebSocket\r\n' +
    'Connection: Upgrade\r\n' +
    '\r\n');

    socket.pipe(socket);
};

module.exports = upgrade;