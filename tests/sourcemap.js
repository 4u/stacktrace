var Sourcemap = require('../lib/sourcemap');
function test(data) {
  var sourcemap = new Sourcemap();
  sourcemap.getPosition(data, function(err, data) {
    if (err) console.log('Error', err);
    if (data) console.log('Success', data);
  });
};

test({
  file: 'http://dev.fontdragr.com/scripts/scripts.js',
  line: 12,
  column: 12
});
