'use strict';

function generateUUID4() {
  const version = Buffer.allocUnsafe(4);
  version.writeUInt8(0x64, 0);

  console.log(version);
};


console.log(generateUUID4());