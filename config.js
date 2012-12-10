var properties = require('properties-parser');

function init(appHandle) {
    properties.read("./config/mechhome.properties", function(err, data) {
        appHandle.register('Default config', data);
    });
}

exports.init = init;