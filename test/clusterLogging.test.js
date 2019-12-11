const Logger = require('../dist/Logger').Logger;
const cluster = require('cluster');

let log = new Logger({
    name: 'clustertest',
    useStdOut: true,
    level: 'debug'
});

if (cluster.isMaster) {
    log.debug('this is master');
    console.log(`master pid: ${process.pid}`);
    w = cluster.fork();

    w.on('exit', () => {
        console.log('exited!!!!!!!!!!!!!');
    });
} else {
    console.log(`fork pid: ${process.pid}`);

    log.debug('this is fork');

    let obj = { a: 'hello' };
    obj.b = obj;
    log.debug(obj);
    process.exit();
}