var config = require('../config');
var crypto = require('crypto');
var fs = require('fs');
var loader = require('./loader');
var path = require('path');
var sourceMap = require('source-map');

/**
 * Модуль возвращает {sourceMap.SourceMapConsumer}. Есть два уровня кэша:
 *    1. Кэш готовых сурсмэпов, живущий в _processCache, пока жив процесс
 *    2. Кэш сырых сурсмэпов, живущий в папке config.cacheDir
 * Если в кэше нужного сурсмэпа нет, модуль его скачает и сложит в кэш
 * @constructor
 */
var Cache = function() {
  this._processCache = {};
};

/**
 * Асинхронно возвращает нужный сурсмэп
 * @param {string} file Путь до файла в интернете
 * @param {string} name Имя сурсмэпа. Оно хранится в поле file. Нужно это
 *     потому, что в одном файле может лежать несколько сурсмэпов. Например,
 *     ClosureBuilder scorpix'а генерит именно такие.
 * @param {function(Error, sourceMap.SourceMapConsumer?)} cb
 */
Cache.prototype.get = function(file, name, cb) {
  var hash = this.hash(file);
  var sourcemap = this.getInternal(file, name);
  if (sourcemap) {
    return cb(null, sourcemap);
  }

  try {
    var list = require(this.tmp(hash));
    cb(null, this.getInternal(file, name, list));
  } catch(ex) {
    this.download(file, function(err, list) {
      if (err) return cb(err);
      cb(null, this.getInternal(file, name, list));
    });
  }
};

/**
 * Возвращает нужный сурсмэп из {_processCache}. Если его там нет, парсит
 * {opt_list}, сохраняет результаты в {_processCache} и возвращает
 * @param {string} file Путь до файла в интернете
 * @param {string} name Имя сурсмэпа. Оно хранится в поле file. Нужно это
 *     потому, что в одном файле может лежать несколько сурсмэпов. Например,
 *     ClosureBuilder scorpix'а генерит именно такие.
 * @param {Array.<Object>=} opt_list Список сырых сурсмэпов
 * @return {sourceMap.SourceMapConsumer?}
 */
Cache.prototype.getInternal = function(file, name, opt_list) {
  var key = this.hash(file) + name;
  var sourcemap = this._processCache[key];
  if (!sourcemap) {
    sourcemap = this.findMapInListAndProcess(opt_list || [], name);
  }

  if (sourcemap) {
    this._processCache[key] = sourcemap;
  }

  return sourcemap || null;
};

/**
 * Находит нужный сурсмэп по имени в списке если список больше 1
 * @param {Array.<Object>} list Список сырых сурсмэпов
 * @param {string} name Имя нужого сурсмэпа
 * @return {sourceMap.SourceMapConsumer?}
 */
Cache.prototype.findMapInListAndProcess = function(list, name) {
  for (var i = 0; i < list.length; i++) {
    if (!name || list[i].file === name) {
      return new sourceMap.SourceMapConsumer(list[i]);
    }
  }
  return null;
};

/**
 * Скачивает сурсмэп и форматирует его, чтобы он стал модулем для node.js
 * @param {string} file Имя файла в интернете
 * @param {function(Error, Array.<Object>)} cb Коллбэк со списком
 *     сырых сурсмэпов
 */
Cache.prototype.download = function(file, cb) {
  loader('GET', file, null, function(err, data) {
    if (err) return cb.call(this, err);

    var list = null;
    data = '[' + data.replace(/(})((\s|\n|\t)*{)/g, '$1,$2') + ']';
    try {
      list = JSON.parse(data);
      fs.writeFileSync(this.tmp(this.hash(file)), 'module.exports = ' + data);
    } catch(ex) {
      err = new Error('Can not parse json from ' + file);
    }
    cb.call(this, err, list);
  }, this);
};

/**
 * Хэш используется для имени файла в папке config.cacheDir
 * @param {string} file Путь до сурсмэпа в интернете
 * @return {string}
 */
Cache.prototype.hash = function(file) {
  return crypto.createHash('md5').update(file).digest('hex');
};

/**
 * Возвращает путь до файла в config.cacheDir по имени файла
 * @param {string} file Имя файла
 * @return {string} Полный путь до файла
 */
Cache.prototype.tmp = function(file) {
  return path.resolve(config.cacheDir, file);
};

/**
 * Работает как синглтон
 */
module.exports = new Cache();
