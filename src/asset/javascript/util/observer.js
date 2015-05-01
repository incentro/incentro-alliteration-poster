var rivets = require('rivets');
var sightglass = rivets._.sightglass;

var observer = function(dataObject, path, callback){
    return sightglass(dataObject, path, callback, {
        root: '.',
        adapters: rivets.adapters
    });
};

module.exports = observer;
