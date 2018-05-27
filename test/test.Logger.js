/**
 * Created by ben on 11/6/15.
 */
'use strict';

var chai = require('./chai');
const Logger = require('../Logger');
const fs = require('fs');
const path = require('path');
const cluster = require('cluster');

describe('LOGGER', function(){
    it('logs to file', function(done){
       var logger = new Logger({name:'bunyanlog.test'});
       logger.error('hello world');

       var logFile = 'bunyanlog.test.log';

       fs.stat(path.join('./logs/', logFile), function(error, stats){
           expect(error).to.equal(null);
           expect(stats.isFile()).to.equal(true);
           done();
       });
    });
});