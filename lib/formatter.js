var util = require('util');

/**
 * Приводит результат парсера в человекопонятный вид
 * @param {Parser.Result} data
 * @return {string}
 */
module.exports = function(data) {
  return data.lines.map(function(line, index) {
    var source = data.source[index];
    var result = '<  ' + line;
    if (source) {
      result += util.format('\n>  at %s (%s:%s:%s)',
          source.name, source.source, source.line, source.column);
    }
    return result;
  }).join('\n');
};
