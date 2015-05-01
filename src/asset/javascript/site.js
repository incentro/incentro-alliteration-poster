var rivets = require('rivets');
var dataObject = {
    name: 'world',
    count: 0
};

document.body.innerHTML = 'Hello {name}, {count}';
rivets.bind(document.body, dataObject);

setInterval(function(){
    dataObject.count++;
}, 500);
