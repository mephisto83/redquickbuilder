var fs = require('fs');
var os = require('os');
var path = require('path');
console.log('execute red quick distro worker')
var VisiBlend = require('./dist/visi_blend/src/visualize').default;
(async function () {
  //D:\temp\d\cloudy_crossbow_822643d2\stages
  await VisiBlend(path.join('d:', 'temp', 'd', 'cloudy_crossbow_822643d2', 'stages', 'COMPLETED_BUILD.rqb'));
})();
