var rivets = require('rivets');
var objectData = require('../data/objects');

require('../binder/backgroundImage');

class CreatorLayoutView {
    constructor(element) {
        this.data = {
            playWord: 'plee',
            workWord: 'wurk',
            objects: objectData,
            activeObject: {},
            onPosterSelect : function(event, data){
                this.data.activeObject = data.object;
            }.bind(this)
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
