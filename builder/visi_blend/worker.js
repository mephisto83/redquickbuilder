var fs = require('fs');
var os = require('os');
var path = require('path');
console.log('execute red quick distro worker')
var VisiBlend = require('./dist/visi_blend/src/visualize').default;
(async function () {

  await VisiBlend(path.join('d:', 'wd', 'test38', 'project.rqb'));
})();
