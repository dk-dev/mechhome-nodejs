var winston = require('winston');

function init(appHandle) {
    appHandle.register('Winston logger', function(type, obj) {
        if (type != 'subsystem') {
            winston.info(obj);    
        }
    });
}

exports.init = init;