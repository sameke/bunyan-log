const cluster = require('cluster');
const Logger = require('../Logger').Logger;

let log = new Logger({
    name: 'clustertest',
    useStdOut: true,
    level: 'debug'
});

if(cluster.isMaster) {    
    log.debug('this is master');
    cluster.fork();
} else {    
    log.debug('this is fork');

    let circular = {a: 'hello'};
    circular.b = circular;
    log.debug(circular);
}