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

    const data = invoice;
    const invoiceId = Date.now();
    const jsonData = other.getInvoiceData();
    const { amount } = data.file;

    jsonData.push({
        invoiceId: invoiceId,
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
    }

    // OK
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

function fileList(token) {
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

    const invoicesList = [];

    const jsonData = other.getInvoiceData();
    for (const invoice of jsonData) {
        if (invoice.owner === tokenValidation.username) {
            invoicesList.push({
                invoiceId: invoice.invoiceId,
                invoiceName: invoice.invoiceName,
                amount: invoice.amount,
                date: invoice.data,
                trashed: invoice.trashed
            });
        }
    }

    return {
        code: 200,
        ret: {
            success: true,
            invoices: invoicesList
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

function modifyFile(invoiceId, token, newName, newAmount, newDate) {
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
    } else if (invoice.owner !== tokenValidation.username) {
        return {
            code: 403,
            ret: {
                success: false,
                error: `Not owner of this invoice '${invoiceId}'`
            }
        };
    } else if (!AreValidEntries(newName, newAmount, newDate)) {
        return {
            code: 400,
            ret: {
                success: false,
                error: "Invalid entry provided; could not modify"
            }
        };
    }

    // modify the entries as requied
    if (newAmount !== invoice.amount && !isEmptyOrNull(newAmount)) {
        invoice.amount = newAmount;
    }

    if (!isEmptyOrNull(newDate)) {
        invoice.date = newDate;
    }

    if (!isEmptyOrNull(newName)) {
        invoice.invoiceName = newName;
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

function isEmptyOrNull(entry) {
    return entry === undefined || entry === null || entry.toString().trim().length === 0;
}

function AreValidEntries(newName, newAmount, newDate) {
    if (isEmptyOrNull(newAmount) && isEmptyOrNull(newDate) && isEmptyOrNull(newName)) {
        return false;
    }

    // cases to handle
    /**
     * !emptynewAmount !emptynewDate !emptyName - added stub - added logic
     * !emptynewAmount !emptynewDate emptyName - added stub - added logic
     * !emptynewAmount emptynewDate emptyName - added stub - added logic
     * !emptynewAmount emptynewDate !emptyName - added stub - added logic
     * emptynewAmount !emptynewDate !emptyname - added stub - added logic
     * emptynewAmount !emptynewDate emptyName - added stub - added logic
     * emptynewAmount emptynewDate !emptyName - added stub - added logic
     */

    if (!isEmptyOrNull(newAmount)) {
        if (!isEmptyOrNull(newDate) && isEmptyOrNull(newName)) {
            if (parseInt(newAmount) > 0 && (new Date(newDate)) <= Date.now()) {
                return true;
            }
        } else if (!isEmptyOrNull(newDate) && !isEmptyOrNull(newName)) {
            //return true; // STUB
            return parseInt(newAmount) > 0 && (new Date(newDate)) <= Date.now();
        } else if (isEmptyOrNull(newDate) && !isEmptyOrNull(newName)) {
            // return true; // STUB
            return parseInt(newAmount) > 0;
        } else {
            // clean up at end
            return parseInt(newAmount) > 0;
        }
    // from here onwaards, Handle logic when empty amount
    } else if (!isEmptyOrNull(newDate)) {
        if (!isEmptyOrNull(newName)) {
            // return true; // STUB
            return (new Date(newDate)) <= Date.now();
        } else if ((new Date(newDate)) <= Date.now()) {
            // return true; // Modify logic
            // cleanup at end
            return (new Date(newDate)) <= Date.now();
        }
    } else if (!isEmptyOrNull(newName)) {
        return true; // STUB - OK to go
    }

    return false;
}

module.exports = { uploadFile, retrieveFile, moveInvoiceToTrash, modifyFile, fileList };
