# bunyan-log

Simple wrapper around bunyan which sets many common defaults.
**REQUIRES ECMAScript6 friendly node version**

##install

$npm install bunyan-log

##usage

```javascript
var Logger = require('bunyan-log');

var log = new Logger({name: 'myLogger'});
log.debug('hi, my name is ben.');
```

**constructor**  
``` var log = new Logger([options])```  
See [node-bunyan](https://github.com/trentm/node-bunyan) for options that can be set.  

* logging to stdout: ```options.useStdOut = true;```
* not logging to file: ```options.useFile = false;```
* allowing logging to new log file on cluster.fork'd process: ```options.isNewProcess = true```
* allow process created with child_process.fork to send to parent: ```options.sendToParent = true```
* default path for logs is [root]/logs directory