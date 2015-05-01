var rivets = require('rivets');

class CreatorLayoutView {
    constructor(element) {
        this.data = {
            playWord: 'plee',
            workWord: 'wurk',
            posterImage: 'http://www.placekitten.com/300/320'
        };

        this.element = element;
    }

    set element(element) {
        // destory rivets view when replacing element
        if ( this._rivetsView ){
            this._rivetsView.unbind();
        }

        this._element = element;
        this._rivetsView = rivets.bind(this._element, this.data);
    }

    get element() {
        return this._element;
    }
}

module.exports = CreatorLayoutView;
