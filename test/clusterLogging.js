const Logger = require('../dist/Logger').Logger;
const cluster = require('cluster');

let log = new Logger({
    name: 'clustertest',
    useStdOut: true,
    level: 'debug'
});

if (cluster.isMaster) {
    log.debug('this is master');
    w = cluster.fork();

    w.on('exit', () => {
        console.log('exited!!!!!!!!!!!!!');
    });
} else {
    console.log('created fork');
    log.debug('this is fork');

    let obj = { a: 'hello' };
    obj.b = obj;
    log.debug(obj);
    process.exit();
}