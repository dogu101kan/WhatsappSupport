/** @format */

function parseVCard(vcardText) {
    console.log(vcardText);
    const lines = vcardText.split("\n");
    let fn = "";
    let tel = "";

    for (const line of lines) {
        if (line.startsWith("FN:")) {
            fn = line.slice(3);
        } else if (line.startsWith("TEL;type=CELL;waid=")) {
            tel = line.split(":").pop();
        }
    }

    return { fn, tel };
}

export default parseVCard;
