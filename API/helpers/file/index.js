const mime = require('mime-types');

function filenameToMIME(filename) {

    return mime.lookup(filename);
}

function checkDataSize(str) {
    var sizeInBytes = str.length;

    if (sizeInBytes > 10 * 1024 * 1024) {
        return false;
    } else {
        return true;
    }
}
module.exports = {
    filenameToMIME,
    checkDataSize
}