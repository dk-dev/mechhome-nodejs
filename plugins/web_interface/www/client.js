var zoneTable;
var messageTable;
var zsId;
var zsName;
var zsType;

function init() {
    zones = [];
    zoneTable = createZoneTable();
    createMessageTable();
    document.getElementById("zones").appendChild(zoneTable);

    // TODO: Make this dynamic!
    socket = io.connect('http://domain.tld:8000');
    socket.on('event', function(event) {
        processServerEvent(event);
    });
}

function processServerEvent(event) {
    if (event.message) {
        createMessage(
            {
            time : new Date(),
            text : event.message
            });
    }

    if (event.zone) {
        (event.zone.alert == "1") ? createAlert(event.zone) : removeAlert(event.zone);

        zones[parseInt(event.zone.id)] = event.zone;

        var zoneRecord = document.getElementById('zone' + event.zone.id);
        zoneRecord.setAttribute('display', 'inline');
        zoneRecord.innerHTML = '';
        zoneRecord.appendChild(createZoneControls(event.zone));
        zoneRecord.appendChild(createZoneData(event.zone));
    }
}

function createZoneTable() {
    var zt = document.createElement("table");
    zt.setAttribute('id', 'zonetable');

    for ( var x = 1; x < 21; x = x + 1) {
        var zoneRecord = zt.insertRow(x - 1);
        zoneRecord.setAttribute('id', 'zone' + x);
        zoneRecord.setAttribute('display', 'none');
        zoneRecord.appendChild(createZoneControls(
            {
            id : x,
            name : "Unknown",
            monitored : "0",
            armed : "0",
            alert : "0"
            }));
        zoneRecord.appendChild(createZoneData(
            {
            id : x,
            name : "Unknown",
            monitored : "0",
            armed : "0",
            alert : "0"
            }));
    }

    return zt;
}

function createMessageTable() {
    // Header
    var notificationHeader = document.getElementById('notificationHeader');

    var notificationHeaderDiv = document.createElement("div");
    notificationHeaderDiv.setAttribute("class", "notificationHeaderDiv");
    notificationHeaderDiv.appendChild(document.createTextNode("Messages"));
    notificationHeader.appendChild(notificationHeaderDiv);

    // Data
    var notificationData = document.getElementById('notificationData');
    var notificationDataTable = document.createElement("table");
    notificationDataTable.setAttribute('id', 'notificationDataTable');
    notificationData.appendChild(notificationDataTable);
}

function createZoneData(zone) {
    // New zone details
    var zoneData = document.createElement("th");
    zoneData.setAttribute('width', '65%');

    var zoneDataDiv = document.createElement("div");
    zoneDataDiv.setAttribute("id", "zoneDataDiv" + zone.id);

    if (zone.alert >= 1) {
        zoneDataDiv.setAttribute('class', 'openedrow zoneDataDiv');
        zoneDataDiv.appendChild(document.createTextNode(zone.name));
    } else {
        zoneDataDiv.setAttribute('class', 'closedrow zoneDataDiv');
        zoneDataDiv.appendChild(document.createTextNode(zone.name));
    }

    zoneData.appendChild(zoneDataDiv);
    return zoneData;
}

function createZoneControls(zone) {
    var zoneControls = document.createElement("td");
    var zoneControlsDiv = document.createElement("div");
    zoneControlsDiv.setAttribute("class", "zoneControlsDiv");

    // Test/silence button
    var testLink = document.createElement("a");
    var testLinkImg = document.createElement("img");
    testLinkImg.setAttribute("class", "testbutton");

    if (zone.monitored == 1) {
        testLink.setAttribute("onClick", "unmonitor(" + zone.id + ")");
        testLinkImg.setAttribute("src", "/images/test.png");
    } else {
        testLink.setAttribute("onClick", "monitor(" + zone.id + ")");
        testLinkImg.setAttribute("src", "/images/untest.png");
    }

    testLink.appendChild(testLinkImg);

    // Arm/disarm button
    var armLink = document.createElement("a");
    var armLinkImg = document.createElement("img");
    armLinkImg.setAttribute("class", "armbutton");

    if (zone.armed == 1) {
        armLink.setAttribute("onClick", "disarm(" + zone.id + ")");
        armLinkImg.setAttribute("src", "/images/lock.png");
    } else {
        armLink.setAttribute("onClick", "arm(" + zone.id + ")");
        armLinkImg.setAttribute("src", "/images/unlock.png");
    }

    armLink.appendChild(armLinkImg);

    // Configuration button
    var configLink = document.createElement("a");
    configLink.setAttribute("onclick", "showConfig(" + zone.id + ")");
    var configLinkImg = document.createElement("img");
    configLinkImg.setAttribute("src", "/images/config.png");
    configLinkImg.setAttribute("class", "configbutton");
    configLink.appendChild(configLinkImg);

    // Control output
    zoneControlsDiv.appendChild(testLink);
    zoneControlsDiv.appendChild(configLink);
    zoneControlsDiv.appendChild(armLink);
    zoneControls.appendChild(zoneControlsDiv);
    return zoneControls;
}

function createMessage(message) {
    var messageTable = document.getElementById('notificationDataTable');
    var row = messageTable.insertRow(0);

    var dateCell = row.insertCell(-1);
    dateCell.appendChild(document.createTextNode(moment(message.time).format('MMMM Do YYYY, h:mm:ss a') + " : "));
    dateCell.setAttribute('width', '200px');

    var messageCell = row.insertCell(-1);
    messageCell.appendChild(document.createTextNode(message.text));

    row.setAttribute('scope', 'row');
}

function createAlert(zone) {
    var imgX = zone.x - 10;
    var imgY = zone.y - 10;

    var oldAlert = document.getElementById("alertimg" + zone.id);
    if (oldAlert != undefined) {
        oldAlert.setAttribute("style", "position: absolute; left: " + imgX + "px; top: " + imgY + "px;");
    } else {
        var alertImg = document.createElement("img");
        alertImg.setAttribute("id", "alertimg" + zone.id);
        alertImg.setAttribute("class", "alertimg");
        alertImg.setAttribute("src", "images/warning.png");
        alertImg.setAttribute("style", "position: absolute; left: " + imgX + "px; top: " + imgY + "px;");
        document.getElementById("dashboard").appendChild(alertImg);
    }

    var zoneDataDiv = document.getElementById("zoneDataDiv" + zone.id);
    if (zoneDataDiv != undefined) {
        zoneDataDiv.className = 'openedrow zoneDataDiv';
    }
}

function removeAlert(zone) {
    var oldAlert = document.getElementById("alertimg" + zone.id);
    if (oldAlert != undefined) {
        oldAlert.style.display = 'none';
    }

    var zoneDataDiv = document.getElementById("zoneDataDiv" + zone.id);
    if (zoneDataDiv != undefined) {
        zoneDataDiv.className = 'closedrow zoneDataDiv';
    }
}

function arm(id) {
    zoneNew = zones[id];
    zoneNew.armed = "1";
    socket.emit('event',
        {
        type : 'info',
        zone : zoneNew,
        message : zoneNew.name + ' armed by client'
        });
}

function disarm(id) {
    zoneNew = zones[id];
    zoneNew.armed = "0";
    socket.emit('event',
        {
        type : 'info',
        zone : zoneNew,
        message : zoneNew.name + ' disarmed by client'
        });
}

function monitor(id) {
    zoneNew = zones[id];
    zoneNew.monitored = "1";
    socket.emit('event',
        {
        type : 'info',
        zone : zoneNew,
        message : zoneNew.name + ' tested/silenced by client'
        });
}

function unmonitor(id) {
    zoneNew = zones[id];
    zoneNew.monitored = "0";
    socket.emit('event',
        {
        type : 'info',
        zone : zoneNew,
        message : zoneNew.name + ' untested by client'
        });
}

function move(x, y) {
    zsX = document.getElementById("zsXInput");
    zsX.value = x;

    zsY = document.getElementById("zsYInput");
    zsY.value = y;
}

//
//
//

function showConfig(id) {
    var zone = zones[id];

    zsId = document.getElementById("zsIdInput");
    zsId.value = id;

    zsName = document.getElementById("zsNameInput");
    zsName.value = zone.name;

    zsType = document.getElementById("zsTypeInput");
    zsType.value = zone.type;

    zsX = document.getElementById("zsXInput");
    zsX.value = zone.x;

    zsY = document.getElementById("zsYInput");
    zsY.value = zone.y;

    document.getElementById("zoneForm").style.display = 'block';
    document.getElementById("dashboard").style.cursor = 'crosshair';
}

function saveConfig() {
    var zone =
        {
        id : zsId.value,
        name : zsName.value,
        type : zsType.value,
        x : zsX.value,
        y : zsY.value
        };
    socket.emit('event',
        {
        type : 'info',
        zone : zone,
        message : 'Zone settings changed by client'
        });
    document.getElementById("zoneForm").style.display = 'none';
    document.getElementById("dashboard").style.cursor = 'auto';
}

function closeConfig() {
    document.getElementById("zoneForm").style.display = 'none';
    document.getElementById("dashboard").style.cursor = 'auto';
}
