const request = require("supertest");
const sending = "https://invoice-seng2021-24t1-eggs.vercel.app";
const endpoint = "send/email"
const auth = require("./auth.js");

async function invoiceSending(token, recipient, invoiceId) {
    // Check token
    const tokenValidation = auth.tokenIsValid(token);
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
    if (!validator.isEmail(email)) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `Email '${recipient}' is not a valid email address`
            }
        };
    }

    // Retrieve file
    const jsonData = other.getInvoiceData();
    const invoice = jsonData.find(invoice => invoice.invoiceId === parseInt(invoiceId));

    if (invoice === undefined) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `invoiceId '${invoiceId}' does not refer to an existing invoice`
            }
        };
    } else if (invoice.owner !== tokenValidation.username) {
        return {
            code: 403,
            ret: {
                success: false,
                error: `Not owner of this invoice '${invoiceId}'`
            }
        };
    }

    const file = JSON.stringify(invoice);

    // Check their server is online
    const check = await request(sending).get("/");

    if (check.status !== 200) {
        return {
            status: "offline"
        };
    } else {
        const requestBody = {
            from: username,
            recipient: recipient,
            xmlString: file
        }
        const response = await request(sending)
            .post(endpoint)
            .set("Content-Type", "application/json")
            .send(requestBody);
        if (response.status !== 200) {
            return {
                status: "error"
            };
        } else {
            return {
                status: "success"
            };
        }
    }
}

module.exports = { invoiceSending };