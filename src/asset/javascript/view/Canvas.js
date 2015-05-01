require('../vendor/svg');
require('../vendor/svg.export');
require('../vendor/rgbcolor');
require('../vendor/StackBlur');
require('../vendor/canvg');

var settingsData = require('../data/settings');
var observer = require('../util/observer');


class CanvasView {
    constructor(element) {
        this.element = element;

        observer(settingsData, 'playWord', this.syncData.bind(this));
        observer(settingsData, 'workWord', this.syncData.bind(this));
        observer(settingsData, 'activeObject.id', this.syncData.bind(this));

        window.addEventListener('resize', this.syncLayout.bind(this));
        window.addEventListener('load', this.syncLayout.bind(this));
        window.addEventListener('orientationchange', this.syncLayout.bind(this));

        this.syncData();
        this.syncLayout();
    }

    set element(element) {
        this._element = element;

        var draw = this.draw = SVG(element).size(element.offsetWidth, element.offsetHeight);
        this.backdrop = draw
            .rect(element.offsetWidth, element.offsetHeight)
            .attr({ fill: '#fff' })

        this.objectImage = draw.image(settingsData.activeObject.imagePath.preview);

        var workWord;
        var playWord;

        this.text = draw.text(function(add){
            add.tspan('the world');
            add.tspan('is made of ').newLine();
            workWord = add.tspan('');
            add.tspan('and ').newLine();
            playWord = add.tspan('');
        });

        workWord.fill('#888');
        playWord.fill('#888');

        this.workWord = workWord;
        this.playWord = playWord;
    }

    get element() {
        return this._element;
    }

    syncData(){
        this.workWord.clear().text(settingsData.workWord);
        this.playWord.clear().text(settingsData.playWord);
        this.objectImage.load(settingsData.activeObject.imagePath.preview);
    }

    syncLayout(){
        var posterHeight = this.element.offsetHeight;
        var posterWidth = this.element.offsetWidth;

        this.backdrop.size(posterWidth, posterHeight);

        this.objectImage.size(posterWidth, posterHeight/2);
        this.objectImage.x(0);
        this.objectImage.cy(posterHeight *.35);

        this.text.cy(posterHeight *.75);
        this.text.x(posterWidth/2);

        this.text.font({
            family:   'Open Sans'
            , size:     posterHeight / 16
            , anchor:   'middle'
            , leading:  '1.5em'
        });

        this.draw.size(posterWidth, posterHeight);
    }

    download(){
        var canvasElement = document.createElement('canvas');
        canvasElement.width = '1500px';
        canvasElement.height = '2000px';

        canvg(canvasElement, this.element.innerHTML, {
            forceRedraw: function(){
                return true;
            },
            renderCallback: function(){
                var downloadUrl = canvasElement.toDataURL('image/jpeg', 1);
                var anchorELement = document.createElement('a');
                anchorELement.setAttribute('download', encodeURIComponent(settingsData.workWord) + '-' + encodeURIComponent(settingsData.playWord) + '-' + encodeURIComponent(settingsData.activeObject.id) + '.jpg');
                anchorELement.setAttribute('href', downloadUrl);
                document.body.appendChild(anchorELement);
                anchorELement.click();
            }
        });
    }
}

module.exports = CanvasView;

//posterCanvasElement.addEventListener('click', function(){
//    var canvasElement = document.createElement('canvas');
//    canvasElement.width = '1500px';
//    canvasElement.height = '2000px';
//
//    canvg(canvasElement, posterCanvasElement.innerHTML, {
//        forceRedraw: function(){
//            return true;
//        },
//        renderCallback: function(){
//            var downloadUrl = canvasElement.toDataURL("image/jpeg", 1);
//            var anchorELement = document.createElement('a');
//            anchorELement.setAttribute('download', 'poster.jpg');
//            anchorELement.setAttribute('href', downloadUrl);
//            document.body.appendChild(anchorELement);
//            anchorELement.click();
//        }
//    });
//});
