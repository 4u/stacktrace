
var Stack = function(text) {
  this.lines = text.split('\n').map(function(str) {
    return str.trim();
  });
  this.meta = this.parse(this.lines);
  this.normalize(this.meta);
};

/**
 * Описывает урл
 * @type {RegExp}
 */
var URL_REGEXP_PART = '([a-z]+:\/])?\/[a-zA-Z0-9_-]+)';

/**
 * Регулярка для получения урла и строки для webkit и ie11
 * Пример:
 *  at fn (https://a.com/path/to/file.js:662:32)
 *  at fn (/path/tofile.js:662:32)
 * @type {RegExp}
 */
var WEBKIT_REGEXP = new RegExp(
  '\\(' + // открывающая скобка
      '(' + // [1]
        '([a-z]+:/)?/.+' + // url
      ')' +
      ':(\\d+)' + // line [3]
      ':(\\d+)' + // column [4]
  '\\)$' // закрывающая скобка
);

/**
 * Регулярка для получения урла и строки для webkit
 * Пример:
 *  at https://a.com/path/to/file.js:662:32
 * @type {RegExp}
 */
var WEBKIT2_REGEXP = new RegExp(
  'at ' + // открывающая скобка
  '(' + // [1]
    '([a-z]+:/)?/.+' + // url
  ')' +
  ':(\\d+)' + // line [3]
  ':(\\d+)' + // column [4]
  '$'
);

/**
 * Регулярка для получения урла и строки для opera 12
 * Пример:
 *  Error thrown at line 461, column 149 in fn(a) in https://a.com/file.js:
 *  called from line 1, column 1 in fn(a) in https://a.com/file.js:
 *  called via Function.prototype.call() from unknown location in fn(a) in https://a.com/file.js:

 * @type {RegExp}
 */
var PRESTO_REGEXP = new RegExp(
  'line (\\d+), ' + // line [1]
  'column (\\d+)' + // column [2]
  '.+' +
  'in (.+):$' // url [3]
);

/**
 * Регулярка для получения урла и строки для ff
 * Пример:
 *  fn@https://a.com/path/file.js:123:445
 * @type {RegExp}
 */
var FIREFOX_REGEXP = new RegExp(
  '@' + // открывающая скобка
  '([^ ]+)' + // url [1]
  ':(\\d+)' + // line [2]
  ':(\\d+)' // column [3]
);

/**
 * Регулярка для получения урла и строки из ручного ввода
 * Пример:
 * https://a.com/path/file.js:123:445
 * @type {RegExp}
 */
var CUSTOM_REGEXP = new RegExp(
  '^(https?://.+)' + // url [1]
  ':(\\d+)' + // line [2]
  ':(\\d+)$' // column [3]
);

/**
 * @param {Array.<string>} lines
 * @return {Array.<Sourcemap.Position?>}
 */
Stack.prototype.parse = function(lines) {
  return lines.map(this.parseLine, this);
};

/**
 * @param {string} line
 * @return {Sourcemap.Position?}
 */
Stack.prototype.parseLine = function(line) {
  var webkitMatch = line.match(WEBKIT_REGEXP);
  if (webkitMatch) {
    return {
      file: webkitMatch[1],
      line: +webkitMatch[3],
      column: +webkitMatch[4]
    };
  }

  var prestoMatch = line.match(PRESTO_REGEXP);
  if (prestoMatch) {
    return {
      file: prestoMatch[3],
      line: +prestoMatch[1],
      column: +prestoMatch[2]
    };
  }

  var firefoxMatch = line.match(FIREFOX_REGEXP);
  if (firefoxMatch) {
    return {
      file: firefoxMatch[1],
      line: +firefoxMatch[2],
      column: +firefoxMatch[3]
    };
  }

  var webkit2Match = line.match(WEBKIT2_REGEXP);
  if (webkit2Match) {
    return {
      file: webkit2Match[1],
      line: +webkit2Match[3],
      column: +webkit2Match[4]
    };
  }

  var customMatch = line.match(CUSTOM_REGEXP);
  if (customMatch) {
    return {
      file: customMatch[1],
      line: +customMatch[2],
      column: +customMatch[3]
    };
  }

  return null;
};

/**
 * Добавляет домен к урлам, начинающимся с /
 * @param {Array.<Sourcemap.Position?>} meta
 */
Stack.prototype.normalize = function(meta) {
  var domain = '';
  // проходим по стэку в порядке вызова (снизу вверх) и,
  // если нужно, добавляем домен из предыдущей строки
  for (var i = meta.length - 1; i >= 0; i--) {
    var pos = meta[i];
    if (!pos) {
      continue;
    }

    var match = pos.file.match(/^([a-z0-9]+:\/\/.+?)\//);
    domain = match ? match[1] : domain;
    if (pos.file[0] === '/') {
      pos.file = domain + pos.file;
    }
  }
};

module.exports = Stack;