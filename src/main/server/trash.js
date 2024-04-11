const other = require("./other.js");
const auth = require("./auth.js");
const pool = require("./database.js");

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
    } else if (trashInvoice.owner !== tokenValidation.username) {
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

async function listTrashItemsV2(token) {
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

        // This is assuming that the invoices are appended to the end of the SQL database as
        // they get deleted so that the invoices array can be returned in the correct order
        const invoices = await client.query("SELECT invoiceid, invoicename, amount, date FROM trashinfo WHERE owner = $1", [tokenValidation.username]);

        return {
            code: 200,
            ret: {
                success: true,
                invoices: invoices.rows
            }
        };

    } catch (error) {
        console.error("Failed to list trashed invoice:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function deleteTrashV2(invoiceId, token) {
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

        const invoice = await client.query("SELECT * FROM trash WHERE invoiceid = $1", [invoiceId]);
        if (invoice.rows.length === 0) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: `invoiceId '${invoiceId}' does not refer to an existing invoice`
                }
            };
        }

        const invoiceInfo = await client.query("SELECT * FROM trashinfo WHERE invoiceid = $1", [invoiceId]);
        if (invoiceInfo.rows[0].owner !== tokenValidation.username) {
            return {
                code: 403,
                ret: {
                    success: false,
                    error: `Not owner of this invoice '${invoiceId}'`
                }
            };
        }

        await client.query("DELETE FROM trash WHERE invoiceid = $1", [invoiceId]);
        await client.query("DELETE FROM trashinfo WHERE invoiceid = $1", [invoiceId]);

        return {
            code: 200,
            ret: {
                success: true
            }
        };

    } catch (error) {
        console.error("Failed to list trashed invoice:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function restoreTrashV2 (invoiceId, token) {
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

        const trashInvoice = await client.query("SELECT * FROM trash WHERE invoiceid = $1", [invoiceId]);
        if (trashInvoice.rows.length === 0) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: `invoiceId '${invoiceId}' does not refer to an existing invoice`
                }
            };
        }

        const trashInvoiceInfo = await client.query("SELECT * FROM trashinfo WHERE invoiceid = $1", [invoiceId]);
        const name = trashInvoiceInfo.rows[0].invoicename;
        const amount = trashInvoiceInfo.rows[0].amount;
        const date = trashInvoiceInfo.rows[0].date;
        const owner = trashInvoiceInfo.rows[0].owner;
        if (trashInvoiceInfo.rows[0].owner !== tokenValidation.username) {
            return {
                code: 403,
                ret: {
                    success: false,
                    error: `Not owner of this invoice '${invoiceId}'`
                }
            };
        }

        // Add trashed invoice into trash
        await client.query("INSERT INTO invoices (invoiceid, invoice) VALUES ($1, $2)", [invoiceId, trashInvoice.rows[0].invoice]);

        await client.query(`
        INSERT INTO invoiceinfo (invoiceId, invoiceName, owner, amount, date)
        VALUES ($1, $2, $3, $4, $5)
        `, [invoiceId, name, owner, amount, date]);

        // Remove from current invoices
        await client.query("DELETE FROM trash WHERE invoiceid = $1", [invoiceId]);
        await client.query("DELETE FROM trashinfo WHERE invoiceid = $1", [invoiceId]);

        return {
            code: 200,
            ret: {
                success: true
            }
        };

    } catch (error) {
        console.error("Failed to list trashed invoice:", error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { listTrashItems, deleteTrash, restoreTrash, listTrashItemsV2, deleteTrashV2, restoreTrashV2 };
