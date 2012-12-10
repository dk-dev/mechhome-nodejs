var serialport = require('serialport');
var ce = require('cloneextend');

var sp;
var log;
var config;
var database;
var setZone;
var strobe = false;
var siren = false;
var deviceConnected = false;
var deviceRetryInterval = 10000;

function init(appHandle) {
    log = appHandle.log;
    config = appHandle.config;
    database = appHandle.database;
    setZone = appHandle.setZone;
    connectDevice();
    appHandle.register('Arduino device', function(type, obj) {
        if (obj.alert != undefined) {
            evaluateAlertState();
        }
    });
}

function connectDevice() {
    if (!deviceConnected) {
        log('info', 'Attempting device connection...');

        try {
            sp = new serialport.SerialPort(config['arduino.serialport'],
                {
                    parser : serialport.parsers.readline('\n')
                });

            deviceConnected = true;
            log('info', 'Connected to device');

            sp.on('data', function(data) {
                processSerialEvent(data);
            });
        } catch (err) {
            log('error', 'Unable to connect to device: ' + err);
            log('error', 'Trying again in ' + deviceRetryInterval / 1000 + ' seconds...');
            setTimeout(function() {
                connectDevice();
            }, deviceRetryInterval);
        }
    }
}

//Note: The initialization multi-trigger bug is not here
function processSerialEvent(data) {
    //log('debug', 'Received device data: ' + data);
    zonestring = (new String(data)).split(':');
    id = zonestring[0];
    alert = zonestring[1];

    database.zoneExists(id, function(exists) {
        if (exists == 1) {
            // Update zone
            database.getZone(id, function(zone) {
                var zoneOld = zone;
                var zoneNew = ce.clone(zone);
                zoneNew.alert = (alert == 1) ? '0' : '1';
                setZone(zoneOld, zoneNew);
            });
        } else {
            // Create zone
            var zoneNew =
                {
                id : id,
                type : 'unknown',
                name : 'Unnamed zone',
                x : '0',
                y : '0',
                armed : '0',
                alert : alert
                };

            for (i = 1; i < zoneNew.id; i++) {
                database.zoneExists(id, function(innerExists) {
                    if (innerExists == 0) {
                        setZone(null,
                            {
                            id : '\'' + i + '\'',
                            type : 'unknown',
                            name : 'Unnamed zone (implicit)',
                            x : '0',
                            y : '0',
                            armed : '0',
                            alert : '0'
                            });
                    }
                });
            }

            setZone(null, zoneNew);
        }
    });
}

function evaluateAlertState() {
    var oldStrobe = strobe;
    var oldSiren = siren;
    strobe = false;
    siren = false;

    database.getZones(function(zone) {
        if (zone.monitored == '1' && zone.alert == '1') {
            strobe = true;
        }
        if (zone.armed == '1' && zone.alert == '1') {
            strobe = true;
            siren = true;
        }

        if (sp) {
            if (!oldStrobe && strobe) {
                sp.write('strobe\n');
            } else if (oldStrobe && !strobe) {
                sp.write('off\n');
            }

            if (!oldSiren && siren) {
                // sp.write('siren\n');
            }
        }
    });
}

exports.init = init;