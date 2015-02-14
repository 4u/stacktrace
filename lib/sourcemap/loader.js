var url = require('url');
var https = require('https');
var http = require('http');

/**
 * @param {string} method Метод запроса (GET, POST, etc.)
 * @param {string} uri Урл запроса. Поддерживается http и https
 * @param {string=} opt_body Тело запроса
 * @param {function(Error, string?)=} opt_cb
 * @param {Object=} opt_ctx
 */
module.exports = function(method, uri, opt_body, opt_cb, opt_ctx) {
  var options = url.parse(uri);
  options.method = method;

  if (opt_body != null) {
    options.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(opt_body)
    }
  }

  var transport = (options.protocol === 'https:') ? https : http;
  var req = transport.request(options, function(res) {
    var buffs = [];
    res.on('data', function(chunk){
      buffs.push(chunk);
    });
    res.on('end', function() {
      var data = null;
      try {
        var buff = Buffer.concat(buffs);
        var encoding = res.headers['content-encoding'] || '';
        if (encoding.match(/\b(gzip)\b/)) {
          zlib.unzip(buff, function(err, buff) {
            opt_cb && opt_cb.call(opt_ctx, err, err ? null :
                (JSON.parse(buff.toString()) || {}));
          });
        } else {
          opt_cb && opt_cb.call(opt_ctx, null, buff.toString());
        }
      } catch(err) {
        opt_cb && opt_cb.call(opt_ctx, err, null);
      }
    });
  }).on('error', function(e) {
    opt_cb && opt_cb.call(opt_ctx, e, null);
  });

  if (opt_body != null) {
    req.write(opt_body + '\n');
  }
  req.end();
};
