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

    return {success: true};
}

function uploadfile(file) {

    // this is for merging data
    try{
        const data = JSON.parse(file);
        const invoiceId = Date.now();
        
        const jsonData = getData();

        
        jsonData.push({
            invoiceId: invoiceId,
            amount: data.amount
        });

        
        console.log("CAn read data");
        
        setData(jsonData);

        return {success: true, invoice: {
            invoiceId: invoiceId,
            invoiceName: "Name",
            amount: data.amount,
            date: Date.now(),
            trashed: false
        }};
    }

    catch (error) {
        throw new Error("Error uploading file: "+ error.message);
    }      
}

module.exports = { uploadfile, clear };
