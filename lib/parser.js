var async = require('async');
var Sourcemap = require('./sourcemap');
var Stack = require('./stack');

/**
 * Парсит стектрейс и возвращает распаршенный стек и информацию
 * о позициях ошибок в исходном коде
 * 
 * Пример:
 * var parser = new Parser();
 * parser.parse(strTrace, function(err, data) {
 *   if (err) throw err;
 *   console.log(data); // Parser.Result
 * });
 * 
 * @param {string|Parser.Options=} opt_options
 * @constructor
 */
var Parser = function(opt_options) {
  var options = opt_options || {};
  this._ignoreSourcemapErrors = false;
  this.sourcemap = new Sourcemap();
  if (options.mapInfo) {
    this.sourcemap.setMapInfoFunction(options.mapInfo);
  }
  if (options.fixPosition) {
    this.sourcemap.setFixPositionFunction(options.fixPosition);
  }
};

/**
 * @typedef {{
 *     mapInfo: Sourcemap.MapInfoFunction,
 *     fixPosition: Sourcemap.FixPositionFunction
 * }}
 */
Parser.Options;

/**
 * @typedef {{
 *     source: Array.<Sourcemap.Result>,
 *     lines: Array.<string>,
 *     meta: Array.<Sourcemap.Position>
 * }}
 */
Parser.Result;

Parser.PredefinedOptions = {
  OTA: require('./prefedined-options/ota')
};

/**
 * Филлер для async
 * @param {function(Error, *)} cb
 */
Parser.emptyCallback = function(cb) {
  cb(null, null);
};

/**
 * true: игнорировать ошибку из sourcemap и парсить дальше
 * false: вернуть ошибку и остановаить парсинг
 * @param {boolean} ignore
 */
Parser.prototype.setSourcemapErrorsIgnored = function(ignore) {
  this._ignoreSourcemapErrors = ignore;
};

/**
 * @see {#setSourcemapErrorsIgnored}
 */
Parser.prototype.isSourcemapErrorsIgnored = function() {
  return this._ignoreSourcemapErrors;
};

/**
 * Парсит стэк и возвращает позиции в исходном коде и распаршенный стек
 * @param {string} stacktrace
 * @param {function(Error, Parser.Result?)} cb
 */
Parser.prototype.parse = function(stacktrace, cb) {
  stacktrace = new Stack(stacktrace);

  var sourcemap = this.sourcemap;
  var ignoreErrors = this._ignoreSourcemapErrors;
  var tasks = stacktrace.meta.map(function(position) {
    if (position) {
      return function(cb) {
        sourcemap.getPosition(position, function(err, data) {
          cb(ignoreErrors ? null : err, err ? null : data);
        });
      };
    } else {
      return Parser.emptyCallback;
    }
  });

  async.series(tasks, function(err, source) {
    if (err) return cb(err);
    cb(null, {
      source: source,
      lines: stacktrace.lines,
      meta: stacktrace.meta
    });
  });
};

module.exports = Parser;
