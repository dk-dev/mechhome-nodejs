var fs = require('fs');
var url = require('url');
var app = require('http').createServer(processHttpConnection);
var io = require('socket.io').listen(app,
    {
        log : false
    });

var database;
var setZone;
var sockets = [];

function init(appHandle) {
    database = appHandle.database;
    setZone = appHandle.setZone;
    app.listen(8000); // Listen for http requests
    appHandle.register('Web interface', function(type, obj) {
        if (type == 'zone') {
            broadcastEvent({
                type : 'info',
                zone : obj
            });
        } else {
            broadcastEvent({
                type : 'info',
                message : obj
            });
        }
    });
}

function syncDatabase() {
    database.getZones(function(zone) {
        broadcastEvent(
            {
            type : 'info',
            zone : zone
            });
    });
}

function syncClient(socket) {
    database.getZones(function(zone) {
        sendEvent(
            {
            type : 'info',
            zone : zone
            }, socket);
    });
}

function processHttpConnection(req, res) {
    // Todo: Not secure
    //log('debug', 'Received http request: ' + req.url);

    var path = url.parse(req.url).pathname;
    if (path == '/') {
        path = '/index.html';
    }
    sendFile('/www' + path, res);
}

function sendFile(path, res) {
    fs.readFile(__dirname + path, function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + path + ': ' + err);
        }

        res.writeHead(200);
        res.end(data);
    });
}

io.sockets.on('connection', function(socket) {
    processSocketConnection(socket);
});

function processSocketConnection(socket) {
    sendEvent(
        {
        type : 'info',
        message : 'Connected'
        }, socket);
    sockets.push(socket);
    syncClient(socket);

    socket.on('event', function(event) {
        processUserEvent(event);
    });
}

function processUserEvent(event) {
    //log('debug', 'Received user event: ' + event.message);
    if (event.zone) {
        database.getZone(event.zone.id, function(zone) {
            var zoneOld = zone;
            var zoneNew = event.zone;
            setZone(zoneOld, zoneNew);
        });
    }
}

function sendEvent(event, socket) {
    socket.emit('event', event);
}

function broadcastEvent(event) {
    // Todo: implement event cache replay to new connections
    for (x = 0; x < sockets.length; x++) {
        if (sockets[x] == null) {
            continue;
        }
        sockets[x].emit('event', event);
    }
}

exports.init = init;