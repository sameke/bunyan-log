let cp = require('child_process');
let path = require('path');

console.log(process.pid);

cp.fork(path.join(path.resolve(__dirname), 'pm2app.test.js'));