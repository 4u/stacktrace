var stackTrace = require('stack-trace');
var sprintf = require("sprintf-js").sprintf;
var async = require("async");

exports.parse = function(stack, sourcemaps, callback) {
  var err = new Error('');
  err.stack = stack;

  var lines = err.stack.split('\n');
  var stack = stackTrace.parse(err);
  var queue = [];
  stack.forEach(function(line, pos) {
    var matches = line.fileName ? line.fileName.match(/([^ \t\(\)]+\.js)/) : null;
    if (matches) {
      line.file = matches[1];
    }
    if (line.file && line.lineNumber !== undefined && line.columnNumber !== undefined) {
      queue.push(function(callback) {
        sourcemaps.getPosition(line.file, line.lineNumber, line.columnNumber, function(err, data) {
          line.source = data;
          callback(err);
        });
      })
    }
    line.origin = lines[pos + 1];
  });
  stack.message = lines[0];

  async.parallel(queue, function(err){
    callback(err, stack);
  });
};

exports.stringify = function(stack) {
  var result = stack.message + '\n';
  stack.forEach(function(line) {
    var spaces = line.origin.match(/^\s*/);
    spaces = spaces ? spaces[0] : '';
    if (line.source) {
      result += sprintf("%s\n" + spaces + "  > %s in %s:%s:%s\n",
          line.origin,
          line.source.name, line.source.source, line.source.line, line.source.column
      );
    } else {
      result += line.origin + '\n';
    }
  });
  return result;
};