const fs = require("fs");
const path = require("path");

let baseURL = "http://localhost:5000/api/";

const getBaseURL = () => baseURL;
const setBaseURL = (newURL) => (baseURL = newURL);

function getToken() {
    const filePath = __dirname + "/token/token";

    try {
        
        const fileData = fs.readFileSync(filePath);

        console.log(fileData)
        return fileData
    } catch (error) {
        console.error('Dosya okuma hatası:', error.message);
        return null;
    }
}

function setToken(token) {
    const saveDirectory = path.join(__dirname, "token");

    if (!fs.existsSync(saveDirectory)) {
        fs.mkdirSync(saveDirectory);
    }

    const filePath = path.join(saveDirectory, "token");

    fs.writeFileSync(filePath, token);
}

module.exports = {
    getToken,
    setToken,
    getBaseURL,
    setBaseURL,
};
