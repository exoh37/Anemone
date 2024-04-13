const request = require("supertest");
const validator = require("validator");
const sending = "https://invoice-seng2021-24t1-eggs.vercel.app";
const endpoint = "send/email";
const auth = require("./auth.js");
const pool = require("./database.js");

async function invoiceSending(token, recipient, invoiceId) {
    const client = await pool.connect();
    try {
        const tokenValidation = await auth.tokenIsValidV2(token);
        if (!tokenValidation.valid) {
            return {
                code: 401,
                ret: {
                    success: false,
                    error: "Token is empty or invalid"
                }
            };
        }

        // Check recipient email format
        if (!validator.isEmail(recipient)) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: `Email '${recipient}' is not a valid email address`
                }
            };
        }

        const invoice = await client.query("SELECT * FROM invoices i WHERE i.invoiceId = $1", [invoiceId]);
        if (invoice.rows.length === 0) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: `invoiceId '${invoiceId}' does not refer to an existing invoice`
                }
            };
        }

        const invoiceInfo = await client.query("SELECT * FROM invoiceinfo WHERE invoiceId = $1", [invoiceId]);

        if (invoiceInfo.rows[0].owner !== tokenValidation.username) {
            return {
                code: 403,
                ret: {
                    success: false,
                    error: `Not owner of this invoice '${invoiceId}'`
                }
            };
        }

        // Retrieve XML String
        const xmlString = invoice.row[0].invoice;

        // Check their server is online
        const check = await request(sending).get("/");

        if (check.status !== 200) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: "Invoice sending API is offline"
                }
            };
        }

        const requestBody = {
            from: tokenValidation.username,
            recipient,
            xmlString
        };

        const response = await request(sending)
            .post(endpoint)
            .set("Content-Type", "application/json")
            .send(requestBody);
        if (response.status !== 200) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: "Something went wrong when trying to send this invoice. Check your parameters."
                }
            };
        } else {
            return {
                code: 200,
                ret: {
                    success: true
                }
            };
        }

    } catch (error) {
        console.error("Failed to retrieve invoice:", error);
        throw error;
    } finally {
        client.release();
    }

}

module.exports = { invoiceSending };