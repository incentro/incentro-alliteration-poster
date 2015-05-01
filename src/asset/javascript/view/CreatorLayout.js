var rivets = require('rivets');
var objectData = require('../data/objects');
var settingsData = require('../data/settings');
var CanvasView = require('./Canvas');

require('../binder/backgroundImage');

class CreatorLayoutView {
    constructor(element) {
        this.data = {
            objects: objectData,
            settings: settingsData,
            onPosterSelect : function(event, data){
                this.data.settings.activeObject = data.object;
            }.bind(this)
        };

        this.element = element;
    }

    set element(element) {
        this._element = element;
        this._rivetsView = rivets.bind(this._element, this.data);
        this._canvasView = new CanvasView( this._element.querySelector('.creatorLayout_previewCanvas') );
    }

    get element() {
        return this._element;
    }
}

module.exports = CreatorLayoutView;
