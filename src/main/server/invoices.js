const auth = require("./auth.js");
const other = require("./other.js");
const pool = require("./database.js");

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
    } else if (!AreValidEntries(newAmount, newDate)) {
        return {
            code: 400,
            ret: {
                success: false,
                error: "Invalid date or amount provided; could not modify"
            }
        };
    }

    // modify the entries as requied
    if (newAmount !== invoice.amount && newAmount.toString().length !== 0) {
        invoice.amount = newAmount;
    }

    if (newDate !== null && newDate.toString().length !== 0) {
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

function AreValidEntries(newAmount, newDate) {
    if ((newAmount === null && newDate === null) || ((newAmount.toString().trim().length === 0 && newDate.toString().trim().length === 0))) {
        return false;
    }

    if (newAmount !== null && newAmount.toString().trim().length !== 0) {
        if (newDate !== null && newDate.toString().trim().length !== 0) {
            if (parseInt(newAmount) > 0 && (new Date(newDate)) <= Date.now()) {
                return true;
            }
        } else {
            if (parseInt(newAmount) > 0) {
                return true;
            }
        }
    } else if ((new Date(newDate)) <= Date.now()) {
        return true;
    }

    return false;
}

async function uploadFileV2(invoice, token) {
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

        const invoiceId = Date.now();

        await pool.query(`
        INSERT INTO invoices (invoiceId, invoice)
        VALUES ($1, $2)
        `, [invoiceId, invoice]);

        return {
            code: 200,
            ret: {
                success: true,
                invoiceId
            }
        };
    } catch (error) {
        console.error("Failed to upload file:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function retrieveFileV2(invoiceId, token) {
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

        const invoiceItems = await auth.fetchXMLData(invoiceId);
        const name = invoiceItems.invoices.invoice[0].invoiceName[0];
        const amount = invoiceItems.invoices.invoice[0].amount[0];
        const date = invoiceItems.invoices.invoice[0].date[0];
        const trash = invoiceItems.invoices.invoice[0].trashed[0];
        const owner = invoiceItems.invoices.invoice[0].owner[0];

        if (owner !== tokenValidation.username) {
            return {
                code: 403,
                ret: {
                    success: false,
                    error: `Not owner of this invoice '${invoiceId}'`
                }
            };
        }

        let trashed;
        if (trash === "false") {
            trashed = false;
        } else {
            trashed = true;
        }

        // OK
        return {
            code: 200,
            ret: {
                success: true,
                invoice: {
                    invoiceId: Number(invoice.rows[0].invoiceid),
                    invoiceName: name,
                    amount: Number(amount),
                    date: date,
                    trashed: trashed
                }
            }
        };
    } catch (error) {
        console.error("Failed to retrieve invoice:", error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { uploadFile, retrieveFile, moveInvoiceToTrash, modifyFile, fileList, uploadFileV2, retrieveFileV2 };
