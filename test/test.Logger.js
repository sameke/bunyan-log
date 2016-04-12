/**
 * Created by ben on 11/6/15.
 */
'use strict';

var chai = require('./chai');
const Logger = require('../lib/Logger');
const fs = require('fs');
const path = require('path');
const cluster = require('cluster');

describe('LOGGER', function(){
    it('logs to file', function(done){
       var logger = new Logger();
       logger.error('hello world');

       var logFile = 'app.' + process.pid + '.log';

       fs.stat(path.join('./logs/', logFile), function(error, stats){
           expect(error).to.equal(null);
           expect(stats.isFile()).to.equal(true);
           done();
       });
    });
});