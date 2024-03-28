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

function moveInvoiceToTrash(invoiceId, token) {
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
    } else if (invoice.trashed) {
        return {
            code: 400,
            ret: {
                success: false,
                error: "invoiceId refers to an invoice in the trash"
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

    let trashData = other.getTrashData();
    invoice.trashed = true;
    trashData.push(invoice);
    other.setTrashData(trashData);

    jsonData.splice(invoiceIndex, 1);
    other.setInvoiceData(jsonData);


    return {
        code: 200,
        ret: {
            success: true,
        }
    };    


}


module.exports = { uploadFile, retrieveFile, moveInvoiceToTrash };
