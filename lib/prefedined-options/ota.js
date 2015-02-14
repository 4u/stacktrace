var URL_REGEXP = /^(.+)module_(.+_.+)_(.+).js$/;

/** @type {Sourcemap.MapInfoFunction} */
var getMapInfo = function(file) {
  var match = file.match(URL_REGEXP);
  if (match) {
    return {
      file: match[1] + match[2] + '.map',
      name: match[3]
    };
  }
  return null;
};

/** @type {Sourcemap.FixPositionFunction} */
var fixPosition = function(position) {
  var mapInfo = getMapInfo(position.file);
  // if (mapInfo.name === 'app') {
  //   position.line += 3;
  // }
  return position;
};

/** @type {Parser.Options} */
module.exports = {
  mapInfo: getMapInfo,
  fixPosition: fixPosition
};
