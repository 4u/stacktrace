var async = require('async');
var url = require('url');
var path = require('path');
var fs = require('fs');
var https = require('https');
var sourceMap = require('source-map');

exports.SourceMaps = function(urlPrefix) {
  this._urlPrefix = urlPrefix || 'https://localhost:1110';
  this._data = {};
  this._offsetPatterns = [];
  this._callbacks = {};
  this._tmpPath = path.join(__dirname, '..', 'tmp');
};

exports.SourceMaps.prototype.convertFileToSource = function(file) {
  var matches = file.match(this._compressedPattern);
  if (!matches) {
    throw Error('No matches in ' + file + ' (' + this._compressedPattern.toString() + ')');
  }
  return this._sourcePattern.
    replace('$1', matches[1]).
    replace('$2', matches[2]).
    replace('$3', matches[3]).
    replace('$4', matches[4]).
    replace('$5', matches[5]).
    replace('$6', matches[6]).
    replace('$7', matches[7]);
};

exports.SourceMaps.prototype.getMap = function(name) {
  return this._data[name];
};

exports.SourceMaps.prototype.clearCache = function() {
  var dirPath = this._tmpPath;
  var files = fs.readdirSync(this._tmpPath);
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = path.join(this._tmpPath, files[i]);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    }
  }
};

exports.SourceMaps.prototype.createMap = function(name, from, opt_callback) {
  if (!this._callbacks[name]) {
    this._callbacks[name] = [];
  }

  this._callbacks[name].push(opt_callback);
  if (this._callbacks[name].length > 1) {
    return;
  }

  var self = this;
  this.downloadFile(from, function(err, buffer) {
    if (!err) {
      var str = buffer.toString();
      self._data[name] = new sourceMap.SourceMapConsumer(str);
    }

    self._callbacks[name].forEach(function(cb) {
      cb && cb(null);
    });
    self._callbacks[name] = null;
  });
};

exports.SourceMaps.prototype.downloadFile = function(uri, callback) {
  var filename = path.join(this._tmpPath, uri.replace(/(\/|:)/g, '|'));

  if (!fs.existsSync(filename)) {
    console.log('> download: %s', uri);

    var options = url.parse(uri);
    options.rejectUnauthorized = false;
    var req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      }).on('end', function() {
        fs.writeFile(filename, data, function (err) {
          callback(err, data);
        });
      });
    });
    req.end();
  } else {
    fs.readFile(filename, function(err, buffer) {
      callback(err, err ? null : buffer.toString());
    });
  }
}
exports.SourceMaps.prototype.setOffsetPattern = function(pattern, offset) {
  this._offsetPatterns.push({
    pattern: pattern,
    offset: offset
  });
};

exports.SourceMaps.prototype.getPosition = function(file, line, column, callback) {
  file = file.replace(/\.js(\?.*)?$/g, '.map');
  if (file[0] === '/') {
    file = this._urlPrefix + file;
  }

  var name = file.split('/');
  name = name[name.length - 1].replace(/\.map$/, '');

  var offset = 0;
  this._offsetPatterns.forEach(function(item) {
    if (item.pattern.test(name)) {
      offset += item.offset;
    }
  });

  var waterfall = [];
  if (!this.getMap(name)) {
    waterfall.push((function(name, file, callback) {
      this.createMap(name, file, callback);
    }).bind(this, name, file));
  }

  waterfall.push((function(callback) {
    callback(null, this.getMap(name).originalPositionFor({
      line: line - offset,
      column: column
    }));
  }).bind(this));

  async.waterfall(waterfall, callback);
};
