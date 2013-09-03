#!/usr/bin/env node

var fs = require('fs');
var SourceMaps = require('./lib/sourcemaps').SourceMaps;
var stackTrace = require('./lib/stacktrace');
var optimist = require('optimist')
  .usage('Autogenerator for ota project.\nUsage: $0 command type [flags]')
  .boolean('cache')
  .default('cache', true)
  .describe('cache', 'Use if you want to drop cached files')
  .describe('file', 'Use if you want to set file')
  .describe('prefix', 'Use if you want to drop cached files')
  .describe('plovrfile', 'RegExp for filename with plovr configs')
  .describe('help', 'Show this text');
var argv = optimist.argv;

GLOBAL.DEBUG = argv.debug;

var endHandler = function(err, info) {
  info && console.log(info instanceof Array ? info.join('\n') : info);
  if (err) {
    if (GLOBAL.DEBUG) throw err
    else console.log('Error: %s', err.message);
  }
};

var stack = argv._[0];
var file = argv.file;
if (file) {
  stack = fs.readFileSync(file).toString();
}

if (stack) {
  console.log('');
  var urlPrefix = stack.match(/(https?:\/\/[^/ $]+)/);
  if (!urlPrefix) {
    throw new Error("Can't recognize url prefix in stack:\n%s", stack);
  }
  var sourcemaps = new SourceMaps(urlPrefix[0]);
  if (!argv.cache) {
    sourcemaps.clearCache();
  }
  if (argv.plovrfile) {
    sourcemaps.setOffsetPattern(new RegExp(plovrfile), 3);
  }
  stackTrace.parse(stack, sourcemaps, function(err, data) {
    if (err) throw err;
    console.log('\nFormatted stack:\n\n%s', stackTrace.stringify(data));
  });
} else {
  console.log('Nothing to process');
}