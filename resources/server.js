var fs = require('fs'),
    https = require('https'),
    jsonServer = require('json-server'),
    routes = require('./routes.json'),
    server = jsonServer.create(),
    router = jsonServer.router('db.json'),
    middlewares = jsonServer.defaults();

var options = {
    // key: fs.readFileSync('./ssl/key.pem'),
    // cert: fs.readFileSync('./ssl/cert.pem'),
    host: '192.168.1.147',
    noCors: true
};
// Add this before server.use(router)
server.use(jsonServer.rewriter(routes))

server.use(middlewares);
server.use(router);
let port = 3050;
https.createServer(options, server).listen(port, function () {
    console.log("json-server started on port " + port);
});