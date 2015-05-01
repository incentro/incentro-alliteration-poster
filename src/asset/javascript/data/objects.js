var imagePath = 'asset/image/object/';

// read all image names from object folder
var fs = require('fs');
var objectData = fs.readdirSync(__dirname + '/../../image/object');

// transform object file names to extendable object datbase
objectData = objectData.map(function(objectFilename){
    objectFilename = objectFilename.replace(/\.[^/.]+$/, "");
    return {
        id: objectFilename,
        imagePath: {
            thumbnail: imagePath + objectFilename + '-thumbnail.jpg',
            preview: imagePath + objectFilename + '-preview.jpg',
            large: imagePath + objectFilename + '-large.jpg'
        }
    }
});

module.exports = objectData;
