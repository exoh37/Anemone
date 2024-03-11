const fs = require("fs");


const JSON_PATH = "src/main/server/TEMP_invoiceStorage.json";

function getData() {
    const jsonData = fs.readFileSync(JSON_PATH);

    const data = JSON.parse(String(jsonData));
    return data;
}
function setData(newData) {
    const jsonData = JSON.stringify(newData);
    fs.writeFileSync(JSON_PATH, jsonData);
}

function clear() {
    let data = getData();
    
    data = [];

    setData(data);

    return;
}

function uploadfile(file) {

    // this is for merging data
    try{
        const data = JSON.parse(file);
        const invoiceId = Date.now();
        
        const jsonData = getData();

        
        jsonData.push({
            invoiceId: invoiceId,
            amount: data
        });

        
        console.log("CAn read data");
        
        setData(jsonData);

        return invoiceId;
    }

    catch (error) {
        throw new Error("Error uploading file: "+ error.message);
    }      
}

module.exports = { uploadfile, clear };