var getQueryParameter = require('../util/getQueryParameter');
var objectData = require('../data/objects');
var observer = require('../util/observer');

var objectId = getQueryParameter('play');
var activeObject = objectData[0];

objectData.forEach(function(object){
    if (object.id == objectId){
        activeObject = object;
    }
});

var settings = {
    playWord: getQueryParameter('play') || '',
    workWord: getQueryParameter('work') || '',
    activeObject: activeObject
};

// allow settings to be persisted in the url
var syncSettingsInUrl = function(){
    var queryParameters = [
        'play=' + encodeURIComponent(settings.playWord),
        'word=' + encodeURIComponent(settings.workWord),
        'object=' + encodeURIComponent(settings.activeObject.id)
    ];
    var pageUrl = '?' + queryParameters.join('&');
    window.history.replaceState('', '', pageUrl);
};

syncSettingsInUrl();

// update setings in url when changes occur
observer(settings, 'playWord', syncSettingsInUrl);
observer(settings, 'workWord', syncSettingsInUrl);
observer(settings, 'activeObject.id', syncSettingsInUrl);


module.exports = settings;
