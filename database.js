var redis = require('redis');
var db = null;
var connected = false;
var log;
var app;

function init(appHandle) {
    log = appHandle.log;
    app = appHandle;
    connect();
}

function connect() {
    if (!connected) {
        log('info', 'Attempting database connection...');
        db = redis.createClient();

        db.on('error', function (err) {
            console.log('[Error] Redis: ' + err);
        });
        
        db.on('ready', function (err) {
            connected = true;
            log('[Info] Connected to database');
            initialize();
        });
    }
}

// TODO: Initialize from file
function initialize() {
    if (!connected) {
        return;
    }
    
    log('info', 'Initializing database');
    db.flushall();
    setZone('1', { id : '1', name : 'Front door', type : 'door', x : '212', y : '439', monitored : '0', armed : '1', alert : '0' });
    setZone('2', { id : '2', name : 'Balcony door', type : 'door', x : '447', y : '68', monitored : '0', armed : '1', alert : '0' });
    setZone('3', { id : '3', name : 'Back door', type : 'door', x : '419', y : '67', monitored : '0', armed : '1', alert : '0' });
    setZone('4', { id : '4', name : 'Study window 1', type : 'window', x : '268', y : '471', monitored : '0', armed : '0', alert : '0' });
    setZone('5', { id : '5', name : 'Study window 2', type : 'window', x : '294', y : '525', monitored : '0', armed : '0', alert : '0' });
    setZone('6', { id : '6', name : 'Laundry room window', type : 'window', x : '591', y : '398', monitored : '0', armed : '0', alert : '0' });
    setZone('7', { id : '7', name : 'Family room window 1', type : 'window', x : '666', y : '140', monitored : '0', armed : '0', alert : '0' });
    setZone('8', { id : '8', name : 'Family room window 2', type : 'window', x : '726', y : '140', monitored : '0', armed : '0', alert : '0' });
    setZone('9', { id : '9', name : 'Family room window 3', type : 'window', x : '786', y : '140', monitored : '0', armed : '0', alert : '0' });
    setZone('10', { id : '10', name : 'Breakfast nook window', type : 'window', x : '343', y : '12', monitored : '0', armed : '0', alert : '0' });
    setZone('11', { id : '11', name : 'Dining room window 1', type : 'window', x : '129', y : '81', monitored : '0', armed : '0', alert : '0' });
    setZone('12', { id : '12', name : 'Dining room window 2', type : 'window', x : '194', y : '35', monitored : '0', armed : '0', alert : '0' });
    setZone('13', { id : '13', name : 'Living room window 1', type : 'window', x : '12', y : '265', monitored : '0', armed : '0', alert : '0' });
    setZone('14', { id : '14', name : 'Living room window 2', type : 'window', x : '11', y : '162', monitored : '0', armed : '0', alert : '0' });
    setZone('15', { id : '15', name : 'Living room window 3', type : 'window', x : '72', y : '129', monitored : '0', armed : '0', alert : '0' });
    setZone('16', { id : '16', name : '1-car garage door', type : 'garage door', x : '80', y : '558', monitored : '0', armed : '0', alert : '0' });
    setZone('17', { id : '17', name : '2-car garage door', type : 'garage door', x : '341', y : '663', monitored : '0', armed : '0', alert : '0' });
    setZone('18', { id : '18', name : '2-car side door', type : 'door', x : '590', y : '502', monitored : '0', armed : '0', alert : '0' });
    setZone('19', { id : '19', name : '2-car vehicle sensor', type : 'induction', x : '465', y : '673', monitored : '0', armed : '0', alert : '0' });
    setZone('20', { id : '20', name : 'Entry motion', type : 'motion', x : '244', y : '372', monitored : '0', armed : '0', alert : '0' });
    
    app.register('Redis database', { connected : connected, zoneExists : zoneExists, setZone : setZone, getZone : getZone, getZones : getZones });
}

var setZone = function(id, zone) {
    //log('debug', 'Saving zone: ' + zone.name);
    db.hmset(id, zone);
}

var getZone = function(id, cb) {
    //log('debug', 'Retrieving zone: ' + id);
    db.hgetall(id, function (err, obj) {
        if (err) {
            console.log('error', 'Redis: ' + err);
            return;
        }
        
        cb(obj);
    });
}

var getZones = function(cb) {
    db.keys('*', function(err, rows) {
        if (rows.length == 0) {
            return;
        }

        rows.forEach(function (id, index) {
            getZone(id, function(zone) {
                //log('debug', 'Syncing zone: ' + zone.name);
                cb(zone);
            });
        });
    });
}

var getZones = function(cb, finished) {
    db.keys('*', function(err, rows) {
        if (rows.length == 0) {
            return;
        }

        rows.forEach(function (id, index) {
            getZone(id, function(zone) {
                //log('debug', 'Syncing zone: ' + zone.name);
                cb(zone);
            });
        });
    });
}

var zoneExists = function(id, cb) {
    //log('debug', 'Checking for zone: ' + id);
    db.exists(id, function (err, obj) {
        if (err) {
            log('error', 'Redis: ' + err);
            return;
        }
        
        cb(obj);
    });
}

exports.init = init;