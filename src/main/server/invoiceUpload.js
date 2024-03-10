const fs = require("fs");

function uploadfile(file) {

    // this is for merging data
    const data = JSON.parse(file);

    const jsonData = fs.readFileSync("TEMP_invoiceStorage.json");
    const existingData = JSON.parse(jsonData);

    existingData.push(data);

    fs.writeFileSync("TEMP_invoiceStorage.json", JSON.stringify(existingData, null, 2));


    return true;
}

module.exports = { uploadfile };