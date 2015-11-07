# bunyan-log

Simple wrapper around bunyan which sets many common defaults.
**REQUIRES ECMAScript6 friendly node version**

##install

$npm install bunyan-log

##usage

```javascript
var Logger = require('bunyan-log');

var log = new Logger();
log.debug('hi, my name is ben.');
```

**constructor**
``` var log = new Logger([options])```
See [node-bunyan](https://github.com/trentm/node-bunyan) for options that can be set.

logging to stdout: ```options.useStdOut = true```
default path for logs is [root]/logs directory