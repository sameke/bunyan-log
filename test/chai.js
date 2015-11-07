/**
 * Created by ben on 11/6/15.
 */
'use strict';

var chai = require('chai');
chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;