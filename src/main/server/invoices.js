const auth = require("./auth.js");
const other = require("./other.js");
const validate = require("./validate.js");
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

    if (!isEmptyOrNull(newAmount)) {
        if (!isEmptyOrNull(newDate) && isEmptyOrNull(newName) ||
            !isEmptyOrNull(newDate) && !isEmptyOrNull(newName)) {
            return parseInt(newAmount) > 0 && (new Date(newDate)) <= Date.now();
        } else {
            return parseInt(newAmount) > 0;
        }
    } else if (!isEmptyOrNull(newDate)) {
        return (new Date(newDate)) <= Date.now();
    } else if (!isEmptyOrNull(newName)) {
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

        // Invoice Validation Stuff
        const validation = await validate.invoiceValidation(invoice);
        if (validation.status === "offline") {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: "Validation API is offline"
                }
            };
        } else if (validation.status === "invalid") {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: "Invoice is of invalid format"
                }
            };
        }

        const invoiceId = Date.now();

        await pool.query(`
        INSERT INTO invoices (invoiceId, invoice)
        VALUES ($1, $2)
        `, [invoiceId, invoice]);

        const invoiceItems = await auth.fetchXMLData(invoiceId);
        const name = invoiceItems.invoice.invoiceName[0];
        const amount = invoiceItems.invoice.amount[0];
        const date = invoiceItems.invoice.date[0];
        const owner = tokenValidation.username;

        await pool.query(`
        INSERT INTO invoiceInfo (invoiceId, invoiceName, owner, amount, date)
        VALUES ($1, $2, $3, $4, $5)
        `, [invoiceId, name, owner, amount, date]);

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

        // OK
        return {
            code: 200,
            ret: {
                success: true,
                invoice: {
                    invoiceId: invoiceInfo.rows[0].invoiceid,
                    invoiceName: invoiceInfo.rows[0].invoicename,
                    amount: invoiceInfo.rows[0].amount,
                    date: invoiceInfo.rows[0].date,
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

async function fileListV2(token) {
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

        const invoicesList = await client.query("SELECT invoiceid, invoicename, amount, date FROM invoiceinfo WHERE owner = $1", [tokenValidation.username]);

        return {
            code: 200,
            ret: {
                success: true,
                invoices: invoicesList.rows
            }
        };
    } catch (error) {
        console.error("Failed to list invoice:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function moveInvoiceToTrashV2(invoiceId, token) {
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

        const invoiceItems = await client.query("SELECT * FROM invoiceinfo i WHERE i.invoiceid = $1", [invoiceId]);
        const name = invoiceItems.rows[0].invoicename;
        const amount = invoiceItems.rows[0].amount;
        const date = invoiceItems.rows[0].date;
        const owner = invoiceItems.rows[0].owner;
        if (owner !== tokenValidation.username) {
            return {
                code: 403,
                ret: {
                    success: false,
                    error: `Not owner of this invoice '${invoiceId}'`
                }
            };
        }

        // Add trashed invoice into trash
        await client.query("INSERT INTO trash (invoiceid, invoice) VALUES ($1, $2)", [invoiceId, invoice.rows[0].invoice]);

        await client.query(`
        INSERT INTO trashInfo (invoiceId, invoiceName, owner, amount, date)
        VALUES ($1, $2, $3, $4, $5)
        `, [invoiceId, name, owner, amount, date]);

        // Remove from current invoices
        await client.query("DELETE FROM invoices WHERE invoiceid = $1", [invoiceId]);
        await client.query("DELETE FROM invoiceinfo WHERE invoiceid = $1", [invoiceId]);

        return {
            code: 200,
            ret: {
                success: true,
            }
        };
    } catch (error) {
        console.error("Failed to delete invoice:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function modifyFileV2(invoiceId, token, newName, newAmount, newDate) {
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

        const invoice = await client.query("SELECT * FROM invoices WHERE invoiceid = $1", [invoiceId]);
        if (invoice.rows.length === 0) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: `invoiceId '${invoiceId}' does not refer to an existing invoice`
                }
            };
        }

        const invoiceInfo = await client.query("SELECT * FROM invoiceinfo WHERE invoiceid = $1", [invoiceId]);
        if (invoiceInfo.rows[0].owner !== tokenValidation.username) {
            return {
                code: 403,
                ret: {
                    success: false,
                    error: `Not owner of this invoice '${invoiceId}'`
                }
            };
        }

        if (!AreValidEntries(newName, newAmount, newDate)) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: "Invalid entry provided; could not modify"
                }
            };
        }

        // modify the entries as requied
        if (newAmount !== invoiceInfo.rows[0].amount  && !isEmptyOrNull(newAmount)) {
            await client.query("UPDATE invoiceinfo SET amount = $1 WHERE invoiceid = $2", [newAmount, invoiceId]);
            await auth.modifyXMLAmount(invoiceId, newAmount);
        }

        if (!isEmptyOrNull(newDate)) {
            await client.query("UPDATE invoiceinfo SET date = $1 WHERE invoiceid = $2", [newDate, invoiceId]);
            await auth.modifyXMLDate(invoiceId, newDate);
        }

        if (!isEmptyOrNull(newName)) {
            await client.query("UPDATE invoiceinfo SET invoicename = $1 WHERE invoiceid = $2", [newName, invoiceId]);
            await auth.modifyXMLName(invoiceId, newName);
        }

        const updatedInvoice = await client.query("SELECT * FROM invoiceinfo WHERE invoiceid = $1", [invoiceId]);
        // return invoice
        return {
            code: 200,
            ret: {
                success: true,
                invoice: {
                    invoiceId: updatedInvoice.rows[0].invoiceid,
                    invoiceName: updatedInvoice.rows[0].invoicename,
                    amount: updatedInvoice.rows[0].amount,
                    date: updatedInvoice.rows[0].date
                }
            }
        };

    } catch (error) {
        console.error("Failed to delete invoice:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function moveInvoicesToTrash(invoiceIds, token) {
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

        const inputInvoices = invoiceIds.split(",");
        if (inputInvoices.length === 0) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: "InvoiceIds cannot be an empty array"
                }
            };
        }

        // Checks that all invoiceIds in the array are valid before interacting with the database
        for (let i = 0; i < inputInvoices.length; i++) {
            const invoiceItems = await client.query("SELECT * FROM invoiceinfo i WHERE i.invoiceid = $1", [inputInvoices[i]]);
            const trashItems = await client.query("SELECT * FROM trashinfo i WHERE i.invoiceid = $1", [inputInvoices[i]]);

            if (invoiceItems.rows.length === 0 && trashItems.rows.length === 0) { // If invoice does not exist
                return {
                    code: 400,
                    ret: {
                        success: false,
                        error: `${inputInvoices[i]} does not refer to an existing invoice`
                    }
                };
            } else if (invoiceItems.rows.length === 0 && trashItems.rows.length !== 0) { // If invoice exists, but is in the trash
                return {
                    code: 400,
                    ret: {
                        success: false,
                        error: `${inputInvoices[i]} refers to an invoice in trash`
                    }
                };
            } else if (invoiceItems.rows[0].owner !== tokenValidation.username) {
                return {
                    code: 403,
                    ret: {
                        success: false,
                        error: `Not owner of this invoice '${inputInvoices[i]}'`
                    }
                };
            }
        }

        const duplicateCheck = await auth.findDuplicates(inputInvoices);
        if (!duplicateCheck.valid) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: `${duplicateCheck.id} is a duplicate`
                }
            };
        }

        // Add trashed invoice into trash + remove from invoices
        for (let i = 0; i < inputInvoices.length; i++) {
            // Gets invoices and information that are owned by user
            const invoices = await client.query(`
            SELECT * FROM invoices i
            JOIN invoiceInfo info ON info.invoiceid = i.invoiceid
            WHERE info.invoiceid = $1
            `, [inputInvoices[i]]);
            const invoiceId = invoices.rows[0].invoiceid;
            const invoice  = invoices.rows[0].invoice;
            const name = invoices.rows[0].invoicename;
            const owner = invoices.rows[0].owner;
            const amount = invoices.rows[0].amount;
            const date = invoices.rows[0].date;

            await client.query(`
            INSERT INTO trash (invoiceid, invoice) 
            VALUES ($1, $2)`,
            [invoiceId, invoice]);

            await client.query(`
            INSERT INTO trashInfo (invoiceId, invoiceName, owner, amount, date)
            VALUES ($1, $2, $3, $4, $5)
            `, [invoiceId, name, owner, amount, date]);

            // Remove from current invoices
            await client.query(`
            DELETE FROM invoices
            WHERE invoiceid = $1
            `, [inputInvoices[i]]);

            // Remove from current invoice information
            await client.query(`
            DELETE FROM invoiceinfo
            WHERE invoiceid = $1
            `, [inputInvoices[i]]);
        }

        return {
            code: 200,
            ret: {
                success: true,
            }
        };
    } catch (error) {
        console.error("Failed to delete all invoices:", error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { uploadFile, retrieveFile, moveInvoiceToTrash, modifyFile, fileList, uploadFileV2, retrieveFileV2, moveInvoiceToTrashV2, fileListV2, modifyFileV2, moveInvoicesToTrash };
