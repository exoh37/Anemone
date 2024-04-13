const pool = require("./src/main/server/database.js")

async function createTables() {
    const client = await pool.connect();
    try {
        await client.query("CREATE TABLE tokens(tokenid VARCHAR(36) PRIMARY KEY, username Text NOT NULL, expiration BIGINT NOT NULL)");
        await client.query("CREATE TABLE users(username Text NOT NULL, email Text NOT NULL, password Text NOT NULL)");
        await client.query("CREATE TABLE invoices(invoiceid bigint PRIMARY KEY, invoice XML)");
        await client.query("CREATE TABLE invoiceInfo(invoiceid bigint PRIMARY KEY, invoicename Text NOT NULL, owner Text NOT NULL, amount Float NOT NULL, date Text NOT NULL)");
        await client.query("CREATE TABLE trash(invoiceid bigint PRIMARY KEY, invoice XML)");
        await client.query("CREATE TABLE trashInfo(invoiceid bigint PRIMARY KEY, invoicename Text NOT NULL, owner Text NOT NULL, amount Float NOT NULL, date Text NOT NULL)");
    
    } catch (error) {
        console.log(error)
        throw error;
    } finally {
        client.release();
    }
}

createTables();
