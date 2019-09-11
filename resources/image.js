var fs = require('fs');
var path = require('path');


var files = fs.readdirSync('./images');

console.log(files);

var json = files.map(t => ({ img: path.join('./', t) }));

fs.writeFileSync('./images.json', JSON.stringify(json));