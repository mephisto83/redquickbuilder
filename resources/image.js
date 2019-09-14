var fs = require('fs');
var path = require('path');


var files = fs.readdirSync('./images');

console.log(files);

var json = files.map(t => ({ img: 'http://192.168.1.147:8080/images/' + t }));

fs.writeFileSync('./serverimages.json', JSON.stringify(json));