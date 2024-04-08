// For all functions related to setting and getting data.
// Future implementations using SQL can be directly modified in this file without affecting the original implementation.

const fs = require("fs");
const pool = require("./database.js");

const JSON_INVOICE_PATH = "src/main/server/TEMP_invoiceStorage.json";
const JSON_USER_PATH = "src/main/server/TEMP_userStorage.json";
const JSON_TOKENS_PATH = "src/main/server/TEMP_tokenStorage.json";
const JSON_TRASH_PATH = "src/main/server/TEMP_trashStorage.json";

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

async function clearV2() {
    const client = await pool.connect();
    try {
        await pool.query("DELETE FROM tokens");
        await pool.query("DELETE FROM users");
        await pool.query("DELETE FROM invoices");

        return {
            code: 200,
            ret: {
                success: true
            }
        };
    } catch (error) {
        console.error("Error clearing data:", error);
        throw error;
    } finally {
        client.release();
    }
}

// Foo function to suppressing lint errors regarding no unused variables
function foo(param) {
    return param;
}

module.exports = { getInvoiceData, setInvoiceData, getUserData, setUserData, getTokenData, setTokenData, getTrashData, setTrashData, clear, clearV2, foo };
