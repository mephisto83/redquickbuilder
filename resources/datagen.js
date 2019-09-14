var rawdata = require('./rawdata');
var fs = require('fs');
require('./array');
const loremIpsum = require("lorem-ipsum").loremIpsum;
var images = require('./serverimages');
var smash_data = require('./smash_models');
let relations = {
    Customer: {
        Conversations: {
            multiple: true,
            after: 'Conversation',
            type: 'Conversation'
        },
        Owner: {
            after: 'User',
            type: 'User'
        },
        Item: {
            after: 'Item',
            type: 'Item'
        },
        TimelineInfo: {
            after: 'TimelineInfo',
            type: 'TimelineInfo'
        }
    },
    Conversation: {
        Participants: {
            after: 'Customer',
            type: 'Customer',
            multiple: true
        },
        LastMessageSentBy: {
            after: 'Customer',
            type: 'Customer',
            in: 'Participants'
        },
        Owner: {
            after: 'Customer',
            type: 'Customer',
            in: 'Participants'
        }
    },
    Item: {
        Owner: {
            after: 'Customer'
        }
    }
}
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

function generateModels(data, relations, order) {
    let result = {};

    data.map(t => {
        result[t.name] = [].interpolate(0, 10, x => {
            return generateModel(t);
        });
    })
    result.Customer.map((t, _d) => {
        t.conversations = (result.Conversation.map(v => v.id));
        t.owner = result.User[_d].id;
        t.deleted = false;
    });
    result.Conversation.map((t, _d) => {
        t.participants = result.Customer.filter(x => x.conversations.some(v => v === t.id)).map(c => c.id);
        t.lastMessageSentBy = result.Customer[Math.floor(Math.random() * result.Customer.length)].id;
        t.owner = t.lastMessageSentBy;
        t.banned = false;
        t.deleted = false;
    })
    return result;
}
console.log(smash_data.length);

let genmodel = generateModel(smash_data[0]);


let models = [...smash_data];
let order = ['User', 'Customer',];
let generatedModels = generateModels(models, relations);
console.log(JSON.stringify(generatedModels.Customer[0], null, 4));

fs.writeFileSync('./source.json', JSON.stringify(generatedModels, null, 4))