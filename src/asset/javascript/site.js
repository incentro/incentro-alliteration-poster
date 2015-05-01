document.addEventListener('DOMContentLoaded', function() {
    var creatorLayoutElement = document.querySelector('.creatorLayout');
    var CreatorLayoutView = require('./view/CreatorLayout');
    var creatorLayout = new CreatorLayoutView(creatorLayoutElement);
});
