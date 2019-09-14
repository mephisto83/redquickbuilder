var rawdata = require('./rawdata');
require('./array');
const loremIpsum = require("lorem-ipsum").loremIpsum;
var images = require('./images');
var smash_data = require('./smash_models');

const GeneratedDataTypes = {
    FirstName: 'First Name',
    LastName: 'Last Name',
    Name: 'Name',
    Date: 'Date',
    Id: 'Id',
    Ids: 'Ids',
    ProfileImage: 'Profile Image',
    LoremIpsum: 'Lorem-Ipsum',
    Guid: 'Guid',
    ListOfGuids: 'Guids',
    Number: 'Number'
};

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateModel(obj) {
    let { name, properties } = obj;
    let model = {};
    Object.values(properties).map(proDef => {
        if (proDef && proDef.type) {
            model[proDef.jsName] = generate(proDef.type);
        }
        else {
            model[proDef.jsName] = null;
        }
    });

    return model;
}

function generate(type) {
    switch (type) {
        case 'Date':
            return new Date(Date.now()).toISOString();
        case 'ProfileImage':
            return images[Math.floor(Math.random() * images.length)].img;
        case 'LoremIpsum':
            return loremIpsum(); // generates one sentence
        case 'FirstName':
            return rawdata[Math.floor(Math.random() * rawdata.length)].name;
        case 'Number':
            return Math.floor(Math.random() * 100);
        case 'LastName':
            return rawdata[Math.floor(Math.random() * rawdata.length)].name;
        case 'Guid':
            return uuidv4();
        case 'Guids':
            return [].interpolate(0, 10, () => uuidv4());
        case 'Ids':
            return null;
        case 'Id':
            return null;
    }
    throw 'unhandled generation type ' + type;
}

console.log(smash_data.length);

let genmodel = generateModel(smash_data[0]);

console.log(JSON.stringify(genmodel, null, 4));