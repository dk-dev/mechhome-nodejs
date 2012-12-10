// TODO: Implement as plugin

function demoWeb(id, database) {
    database.getZone(id, function(obj) {
        var zone = obj;

        if (zone != undefined) {
            if (zone.alert == 1) {
                processSerialEvent(id + ":0");
            } else {
                processSerialEvent(id + ":1");
                setTimeout(function() {
                    demoWeb(id, database);
                }, 1000);
            }
        } else {
            setTimeout(function() {
                demoWeb(1, database);
            }, 1000);
        }
    });
}

function demoStrobe(sp) {
    if (sp) {
        console.log("Testing strobe...");
        sp.write("strobe\n");
    } else {
        console.log("[Warn] No serial connection for strobe test; retrying in 2 seconds");
        setTimeout(function() {
            demoStrobe();
        }, 2000);
    }
}