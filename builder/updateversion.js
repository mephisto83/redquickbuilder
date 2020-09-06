var fs = require('fs');

let jsonString = fs.readFileSync('./app/package.json');
let json = JSON.parse(jsonString);


let version = json.version.split('.')
version[version.length - 1] = parseInt(version[version.length - 1]) + 1

json.version = version.join('.');


fs.writeFileSync('./app/package.json', JSON.stringify(json, null, 4), 'utf8');
