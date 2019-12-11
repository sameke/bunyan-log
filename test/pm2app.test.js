const Logger = require('../dist/Logger').Logger;
const cluster = require('cluster');


console.log(`child pid: ${process.pid}`);
console.log(cluster.isMaster);
console.log(process.send != null);

let log = new Logger({
    name: 'pm2test' + process.env.pm_id,
    logToParent: false,
    useStdOut: true,
    level: 'debug',
    useFile: false
});

log.error('help me');