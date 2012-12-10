var loggly = require('loggly')
var config;
var client;

function init(appHandle) {
    config =
        {
        subdomain : appHandle.config['loggly.subdomain'],
        auth :
            {
            username : appHandle.config['loggly.username'],
            password : appHandle.config['loggly.password']
            },
        json : appHandle.config['loggly.json']
        };
    client = loggly.createClient(config);
    appHandle.register('Loggly logger', function(type, obj) {
        if (type != 'subsystem') {
            client.log(appHandle.config['loggly.inputkey'], obj);    
        }
    });
}

exports.init = init;
