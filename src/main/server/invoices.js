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

    const invoiceId = Date.now(),
        jsonData = other.getInvoiceData(),
        // Only 2 decimal places
        {amount} = data.file;

    jsonData.push({
        invoiceId,
        invoiceName: "PLACEHOLDER_NAME",
        amount,
        date: Date.now(),
        trashed: false,
        owner: tokenValidation.username
    });
    
    other.setInvoiceData(jsonData);

    return {
        code: 200,
        ret: {
            success: true,
            invoiceId
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

    const jsonData = other.getInvoiceData(),
        invoice = jsonData.find(invoice => invoice.invoiceId === parseInt(invoiceId));
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
    } else if (!AreValidEntries(newAmount, newDate)) { 
        return {
            code: 400,
            ret: {
                success: false,
                error: "Invalid date or amount provided; could not modify"
            }
        };
    // Modifying logic here
    } else {
        // modify the entries as requied
        if (newAmount > 0 && newAmount !== invoice.amount) {
            invoice.amount = newAmount;
        }
        if (newDate) {
            invoice.date = newDate;
        }
        // return invoice
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

function AreValidEntries(newAmount, newDate) {
    // amount and date cant both be null
    // if only amount is null, and date valid, OR date null but amount VALID
    // return true
    //

    if (!((newAmount === null && newDate === null)
    || (new Date(newDate)) > Date.now()
    || newDate === null
    || newDate.toString().trim().length === 0 )) {
        return !(newAmount.toString().trim().length !== 0 && newAmount <= 0);
    }
    return false;
}

module.exports = { uploadFile, retrieveFile, modifyFile };
