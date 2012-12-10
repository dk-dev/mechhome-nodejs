var hashmap = require('hashmap').HashMap;

var database;
require('./database.js').init({ register : setDatabase, log : log});

var config;
require('./config.js').init({ register : setConfig, log : log });

var plugins = new hashmap();

init();

function init() {
    if (config != undefined && database != undefined && database.connected) {
        addPlugins();
        log('info', 'Initialized');
    } else {
        setTimeout(function() {
            init();
        }, 1000);
    }
}

function addPlugins() {
    var plugins = config['mechhome.plugins'].split(',');
    plugins.forEach(function(element, index, array) {
        //log('debug', 'Calling ' + element + ' initializer...');
        require('./plugins/' + element + '/index.js').init(
            {
            register : addPlugin,
            log : log,
            config : config,
            database : database,
            setZone : evaluateZoneChanges
            });
    });
}

function log(type, obj) {
    if (plugins == undefined || plugins.count() == 0) {
        console.log(type + ": " + obj);
        return;
    }

    plugins.forEach(function(pluginCallback, name) {
        pluginCallback(type, obj);
    });
}

function evaluateZoneChanges(zoneOld, zoneNew) {
    //log('debug', 'Evaluating changes for zone ' + zoneNew.id);

    if (!zoneOld) {
        database.setZone(zoneNew.id, zoneNew) // New zone
        log('info', zoneNew.name + ' registered as id ' + zoneNew.id);
        return;
    }

    if (zoneNew.name != undefined && zoneOld.name != zoneNew.name) {
        log('info', zoneOld.name + ' name changed to ' + zoneNew.name); // Name change
    } else {
        zoneNew.name = zoneOld.name;
    }

    if (zoneNew.type != undefined && zoneOld.type != zoneNew.type) {
        log('info', zoneNew.name + ' type changed to ' + zoneNew.type); // Type change
    } else {
        zoneNew.type = zoneOld.type;
    }

    if ((zoneNew.x != undefined || zoneNew.y != undefined) && (zoneOld.x != zoneNew.x || zoneOld.y != zoneNew.y)) {
        log('info', zoneNew.name + ' coordinates changed to (' + zoneNew.x + ',' + zoneNew.y + ')'); // Coordinate change
    } else {
        zoneNew.x = zoneOld.x;
        zoneNew.y = zoneOld.y;
    }

    if (zoneNew.armed != undefined && zoneOld.armed != zoneNew.armed) {
        log('info', zoneNew.name + ((zoneNew.armed == 1) ? ' armed' : ' disarmed')); // Armed/disarmed
    } else {
        zoneNew.armed = zoneOld.armed;
    }

    if (zoneNew.alert != undefined && parseInt(zoneOld.alert) < parseInt(zoneNew.alert)) {
        log('info', zoneNew.name + ' triggered'); // New alert
    } else if (zoneNew.alert != undefined && zoneOld.alert > zoneNew.alert) {
        log('info', zoneNew.name + ' cleared'); // Cleared alert
    } else {
        zoneNew.alert = zoneOld.alert; // Continued alert
    }

    if (zoneNew.monitored != undefined && zoneOld.monitored != zoneNew.monitored) {
        log('info', zoneNew.name + ((zoneNew.monitored == '1') ? ' monitored' : ' un-monitored')); // Monitored/un-monitored
    } else {
        zoneNew.monitored = zoneOld.monitored;
    }

    database.setZone(zoneNew.id, zoneNew);
    log('zone', zoneNew);
}

function setConfig(name, data) {
    log('info', 'Setting config: ' + name);
    config = data;
}

function setDatabase(name, data) {
    log('info', 'Setting database: ' + name);
    database = data;
}

function addPlugin(name, pluginCallback) {
    log('info', 'Adding plugin: ' + name);
    plugins.set(name, pluginCallback);
}

function removePlugin(name) {
    log('info', 'Removing plugin: ' + name);
    plugins.remove(name);
}
