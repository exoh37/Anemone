const auth = require("./auth.js");
const other = require("./other.js");

function uploadFile(invoice, token) {
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
    
    let data;
    
    try {
        // Support both string and object format
        if (typeof data === "string") {
            data = JSON.parse(invoice);
        } else {
            data = invoice;
        }
    } catch (error) {
        return {
            code: 400,
            ret: {
                success: false,
                error: "Invoice is invalid"
            }
        };
    }

    const invoiceId = Date.now();
    const jsonData = other.getInvoiceData();
    // Only 2 decimal places
    const amount = data.file.amount;

    jsonData.push({
        invoiceId: invoiceId,
        invoiceName: "PLACEHOLDER_NAME",
        amount: amount,
        date: Date.now(),
        trashed: false,
        owner: tokenValidation.username
    });
    
    other.setInvoiceData(jsonData);

    return {
        code: 200,
        ret: {
            success: true,
            invoiceId: invoiceId
        }
    };    
}

function retrieveFile(invoiceId, token) {
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
    } else {
        return {
            code: 200,
            ret: {
                success: true,
                invoice: {
                    invoiceId: invoice.invoiceId,
                    invoiceName: invoice.invoiceName,
                    amount: invoice.amount,
                    date: invoice.date,
                    trashed: invoice.trashed
                }
            }
        };
    }
}

function modifyFile(invoiceId, token, newAmount, newDate) {
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

    // notes
    // if both params empty should not modify, return error

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
    } else { // modify logic should be here

    }
}

module.exports = { uploadFile, retrieveFile };
