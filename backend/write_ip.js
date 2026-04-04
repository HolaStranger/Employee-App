const os = require('os');
const fs = require('fs');
const interfaces = os.networkInterfaces();
let results = '';
for (const devName in interfaces) {
  const iface = interfaces[devName];
  for (let i = 0; i < iface.length; i++) {
    const alias = iface[i];
    if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
      results += alias.address + '\n';
    }
  }
}
fs.writeFileSync('ip_output.txt', results);
