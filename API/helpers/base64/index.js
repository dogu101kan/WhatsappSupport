const fs = require('fs');
const path = require('path');
const { filenameToMIME } = require("../file");
const CustomError = require('../error/CustomError');


function base64Split(base64, filename) {

    var pattern = /^data:(.*?);base64,(.*)$/;
    
    var match = base64.match(pattern);
    
    if (match) {
        var mimeType = match[1];
        var veri = match[2];
        
        return {mimetype: mimeType, data: veri};
    } else if(filename!==null && filename!==undefined && filename.split(".")[1]!==null){
            return { mimetype: filenameToMIME(filename), data:base64}
    } else{
        throw new CustomError("Hatalı dosya", 400)
    }
    
}

function base64ToBuffer(base64Data, mimeType) {
    const decodedData = Buffer.from(`data:${mimeType};base64,`+base64Data, "base64");

    return {
        data: decodedData,
        mimeType: mimeType
    };
}


function saveBase64ToFile(base64Data, fileName, foldername) {
    
    const mainDirectory = path.join(__dirname, "..", "..");
    const saveDirectory = path.join(mainDirectory, 'media_base64', foldername);

    if (!fs.existsSync(saveDirectory)) {
        fs.mkdirSync(saveDirectory);
    }

    const filePath = path.join(saveDirectory, fileName);

    fs.writeFileSync(filePath, base64Data);

   return  path.join(saveDirectory, fileName)
}

function readBase64FromFile(filePath) {
    try {
        
        const fileData = fs.readFileSync(filePath, 'utf-8');

        return fileData.trim();
    } catch (error) {
        console.error('Dosya okuma hatası:', error.message);
        return null;
    }
}

module.exports = {
    base64ToBuffer,
    saveBase64ToFile,
    readBase64FromFile,
    base64Split
}


