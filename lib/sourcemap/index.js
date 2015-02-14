var cache = require('./cache');

/**
 * Модуль получает позицию в исходном js коде по позиции
 * в пожатом коде по сурсмапам
 * @constructor
 */
var Sourcemap = function() {
  this._data = {};
  this._callbacks = {};
};

/** @typedef {{ file: string, name: string? }} */
Sourcemap.MapInfo;

/** @typedef {{ file: string, line: number, column: number }} */
Sourcemap.Position;

/** @typedef {{ source: string, line: number, column: number, name: string? }} */
Sourcemap.Result;

/** @typedef {function(string) : Sourcemap.MapInfo?} */
Sourcemap.MapInfoFunction;

/** @typedef {function(Sourcemap.Position) : Sourcemap.Position} */
Sourcemap.FixPositionFunction;

/**
 * Возвращает правильную позицию в пожатом файле.
 * Например, plovr добавляет в начало главного модуля 3 строчки
 * @type {Sourcemap.FixPositionFunction}
 */
Sourcemap.prototype.fixPosition = function(position) {
  return position;
};

/**
 * Заменяет функцию {fixPosition}
 * @param {Sourcemap.FixPositionFunction?} fn
 */
Sourcemap.prototype.setFixPositionFunction = function(fn) {
  if (fn) {
    this.fixPosition = fn;
  } else {
    delete this.fixPosition;
  }
};

/**
 * Возвращиает имя сурсмэпа для файла. Оно указано
 * в каждом сурсмэпе в поле file
 * @type {Sourcemap.MapInfoFunction}
 */
Sourcemap.prototype.getMapInfo = function(file) {
  return {
    file: file + '.map',
    name: null
  };
};

/**
 * @param {Sourcemap.MapInfoFunction?} fn
 */
Sourcemap.prototype.setMapInfoFunction = function(fn) {
  if (fn) {
    this.getMapInfo = fn;
  } else {
    delete this.getMapInfo;
  }
};

/**
 * @param {Sourcemap.Position} position
 * @param {function(Error, Sourcemap.Result)} cb
 */
Sourcemap.prototype.getPosition = function(position, cb) {
  var mapInfo = this.getMapInfo(position.file);
  if (!mapInfo) {
    return cb(new Error('No name for file: ' + position.file));
  }

  position = this.fixPosition(position);

  cache.get(mapInfo.file, mapInfo.name, function(err, map) {
    if (err || !map) return cb(err || new Error('Sourcemap not found'));
    cb(null, map.originalPositionFor({
      line: position.line,
      column: position.column
    }))
  });
};

module.exports = Sourcemap;
