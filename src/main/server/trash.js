const other = require("./other.js");
const auth = require("./auth.js");

function listTrashItems(token) {
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

    const jsonData = other.getTrashData();

    // This is assuming that the invoices are appended to the end of the JSON array as
    // they get deleted so that the invoices array can be returned in the correct order
    let invoices = jsonData.filter(invoice => invoice.owner === tokenValidation.username);

    if (invoices.length === 0) {
        return {
            code: 200,
            ret: {
                success: true,
                invoices: []
            }
        };
    }
    
    invoices = invoices.map(obj => {
        // Remove owner from the array
        const { owner, ...rest } = obj;
        other.foo(owner);
        return rest;
    });

    return {
        code: 200,
        ret: {
            success: true,
            invoices: invoices
        }
    };
}

function deleteTrash(invoiceId, token) { 
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

    const jsonData = other.getTrashData();
    const invoiceIndex = jsonData.findIndex(invoice => invoice.invoiceId === parseInt(invoiceId));
    const invoice = jsonData[invoiceIndex];
    
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

    jsonData.splice(invoiceIndex, 1);
    
    other.setTrashData(jsonData);
    return {
        code: 200,
        ret: {
            success: true
        }
    };
}

function restoreTrash (invoiceId, token) {
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

    const trashData = other.getTrashData();
    const trashIndex = trashData.findIndex(invoice => invoice.invoiceId === parseInt(invoiceId));
    const trashInvoice = trashData[trashIndex];

    if (trashInvoice === undefined) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `invoiceId '${invoiceId}' does not refer to an existing invoice`
            }
        };
    }
    else if (trashInvoice.owner !== tokenValidation.username) {
        return {
            code: 403,
            ret: {
                success: false,
                error: `Not owner of this invoice '${invoiceId}'`
            }
        };
    }

    const jsonData = other.getInvoiceData();
    trashInvoice.trashed = false;
    jsonData.push(trashInvoice);
    trashData.splice(trashIndex, 1);

    other.setTrashData(trashData);
    other.setInvoiceData(jsonData);

    return {
        code: 200,
        ret: {
            success: true
        }
    };
}

module.exports = { listTrashItems, deleteTrash, restoreTrash };