const fs = require("fs"),

    JSON_INVOICE_PATH = "src/main/server/TEMP_invoiceStorage.json",
    JSON_USER_PATH = "src/main/server/TEMP_userStorage.json",
    JSON_TOKENS_PATH = "src/main/server/TEMP_tokenStorage.json",
    JSON_TRASH_PATH = "src/main/server/TEMP_trashStorage.json";

function getInvoiceData() {
    const jsonData = fs.readFileSync(JSON_INVOICE_PATH),
        data = JSON.parse(String(jsonData));
    return data;
}

function setInvoiceData(newData) {
    const jsonData = JSON.stringify(newData);
    fs.writeFileSync(JSON_INVOICE_PATH, jsonData);
}

function getUserData() {
    const jsonData = fs.readFileSync(JSON_USER_PATH),
        data = JSON.parse(String(jsonData));
    return data;
}

function setUserData(newData) {
    const jsonData = JSON.stringify(newData);
    fs.writeFileSync(JSON_USER_PATH, jsonData);
}

function getTokenData() {
    const jsonData = fs.readFileSync(JSON_TOKENS_PATH),
        data = JSON.parse(String(jsonData));
    return data;
}

function setTokenData(newData) {
    const jsonData = JSON.stringify(newData);
    fs.writeFileSync(JSON_TOKENS_PATH, jsonData);
}

function getTrashData() {
    const jsonData = fs.readFileSync(JSON_TRASH_PATH),
        data = JSON.parse(String(jsonData));
    return data;
}

function setTrashData(newData) {
    const jsonData = JSON.stringify(newData);
    fs.writeFileSync(JSON_TRASH_PATH, jsonData);
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

    let trashData = getTrashData();
    trashData = [];
    setTrashData(trashData);

    return {
        code: 200,
        ret: {
            success: true
        }
    };
}

// Suppressing lint error
function foo(param) {
    return param;
}

module.exports = { getInvoiceData, setInvoiceData, getUserData, setUserData, getTokenData, setTokenData, getTrashData, setTrashData, clear, foo };
