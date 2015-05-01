var rivets = require('rivets');
var objectData = require('../data/objects');
var settingsData = require('../data/settings');

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
        // destroy rivets view when replacing element
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
