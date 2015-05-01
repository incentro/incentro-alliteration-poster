var rivets = require('rivets');

rivets.binders['background-image'] = function(el, value) {
    el.style.backgroundImage = 'url(' + value + ')';
};
