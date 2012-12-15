// TODO: Implement as plugin

// Includes
var app = require('http').createServer(processHttpConnection);
var io = require('socket.io').listen(app, { log: false });
var fs = require('fs');
var url = require('url');
var moment = require('moment');

var sockets = [];
var messages = [];

// Main
app.listen(8000); // Listen for http requests

// Client update sockets
function processSocketConnection(socket)
{
	sendEvent({ type: 'info', message: 'Connected' }, socket);
	sockets.push(socket);
	syncClient(socket);
	//syncDatabase();

	socket.on('event', function(event) {
		processUserEvent(event);
	});
}

io.sockets.on('connection', function(socket) { processSocketConnection(socket); }); // Listen for socket connections

function syncClient(socket)
{
	var id = parseInt(rows[row].zid);
	var name = rows[row].name;
	var type = rows[row].type;
	var x = rows[row].xloc;
	var y = rows[row].yloc;
	var armed = rows[row].armed;
	var testing = rows[row].testing;
	var alert = ((zones[id]) ? zones[id].alert : 0);
	
	var zone = { id: id, name: name, type: type, x: x, y: y, armed: armed, testing: testing, alert: alert };
	sendEvent({ time: moment().valueOf(), type: 'info', zone: zone, message: zone.name + ' synced to client' }, socket);
}

function processEvent(event)
{
	// console.log('[Debug] Received user event: ' + event.message);
	
	if (event.zone)
	{
		var zoneOld = zones[event.zone.id];
		var zoneNew = event.zone;
		evaluateZoneChanges(zoneOld, zoneNew);
	}
}

function sendEvent(event, socket)
{
	socket.emit('event', event);
}

function broadcastEvent(event)
{
	// Todo: implement event cache replay to new connections
	for (x = 0; x < sockets.length; x++)
    {
        if (sockets[x] == null) { continue; }
        sockets[x].emit('event', event);
    }
}

