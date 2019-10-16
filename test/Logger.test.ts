// /**
//  * Created by ben on 11/6/15.
//  */
// 'use strict';

import { Logger } from '../src/Logger';
import { expect } from 'chai';
import { ILoggerOptions } from '../src/ILoggerOptions';
import * as fs from 'fs';
import * as path from 'path';

describe('LOGGER', function () {
    it('logs to file', function (done) {
        var logger = new Logger({
            name: 'bunyanlog.test'
        } as ILoggerOptions);
        logger.error('hello world');

        var logFile = 'bunyanlog.test.log';

        fs.stat(path.join('./logs/', logFile), function (error, stats) {
            expect(error).to.equal(null);
            expect(stats.isFile()).to.equal(true);
            done();
        });
    });
});