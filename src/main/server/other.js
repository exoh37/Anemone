const fs = require("fs");

const JSON_INVOICE_PATH = "src/main/server/TEMP_invoiceStorage.json";
const JSON_USER_PATH = "src/main/server/TEMP_userStorage.json";
const JSON_TOKENS_PATH = "src/main/server/TEMP_tokenStorage.json";

function getInvoiceData() {
    const jsonData = fs.readFileSync(JSON_INVOICE_PATH);
    const data = JSON.parse(String(jsonData));
    return data;
}

function setInvoiceData(newData) {
    const jsonData = JSON.stringify(newData);
    fs.writeFileSync(JSON_INVOICE_PATH, jsonData);
}

function getUserData() {
    const jsonData = fs.readFileSync(JSON_USER_PATH);
    const data = JSON.parse(String(jsonData));
    return data;
}

function setUserData(newData) {
    const jsonData = JSON.stringify(newData);
    fs.writeFileSync(JSON_USER_PATH, jsonData);
}

function getTokenData() {
    const jsonData = fs.readFileSync(JSON_TOKENS_PATH);
    const data = JSON.parse(String(jsonData));
    return data;
}

function setTokenData(newData) {
    const jsonData = JSON.stringify(newData);
    fs.writeFileSync(JSON_TOKENS_PATH, jsonData);
}

function clear() {
    let invoiceData = getInvoiceData();
    invoiceData = [];
    setInvoiceData(invoiceData);

    let userData = getUserData();
    userData = [];
    setUserData(userData);

    let tokenData = getTokenData();
    tokenData = [];
    setTokenData(tokenData);

    return {
        code: 200,
        ret: {
            success: true
        }
    };
}

module.exports = { getInvoiceData, setInvoiceData, getUserData, setUserData, getTokenData, setTokenData, clear };
