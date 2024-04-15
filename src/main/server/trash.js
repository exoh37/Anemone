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

async function deleteTrashes(invoiceIds, token) {
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
            if (trashItems.rows.length === 0 && invoiceItems.rows.length === 0) { // If invoice does not exist
                return {
                    code: 400,
                    ret: {
                        success: false,
                        error: `${inputInvoices[i]} does not refer to an existing invoice`
                    }
                };
            } else if (trashItems.rows.length === 0 && invoiceItems.rows.length !== 0) { // If invoice exists, but is not in the trash
                return {
                    code: 400,
                    ret: {
                        success: false,
                        error: `${inputInvoices[i]} refers to an invoice not in the trash`
                    }
                };
            } else if (trashItems.rows[0].owner !== tokenValidation.username) {
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
            // Remove from current invoices
            await client.query(`
            DELETE FROM trash
            WHERE invoiceid = $1
            `, [inputInvoices[i]]);

            // Remove from current invoice information
            await client.query(`
            DELETE FROM trashinfo
            WHERE invoiceid = $1
            `, [inputInvoices[i]]);
        }

        return {
            code: 200,
            ret: {
                success: true
            }
        };

    } catch (error) {
        console.error("Failed to delete all trashed invoice:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function restoreTrashes (invoiceIds, token) {
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
            if (trashItems.rows.length === 0 && invoiceItems.rows.length === 0) { // If invoice does not exist
                return {
                    code: 400,
                    ret: {
                        success: false,
                        error: `invoiceId '${inputInvoices[i]}' does not refer to an existing invoice`
                    }
                };
            } else if (trashItems.rows.length === 0 && invoiceItems.rows.length !== 0) { // If invoice exists, but is not in the trash
                return {
                    code: 400,
                    ret: {
                        success: false,
                        error: `invoiceId '${inputInvoices[i]}' refers to an invoice not in the trash`
                    }
                };
            } else if (trashItems.rows[0].owner !== tokenValidation.username) {
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
                    error: `'${duplicateCheck.id}' is a duplicate invoiceId`
                }
            };
        }

        // Restore trashed invoice + remove from trash
        for (let i = 0; i < inputInvoices.length; i++) {
            // Gets invoices and information that are owned by user
            const invoices = await client.query(`
            SELECT * FROM trash i
            JOIN trashInfo info ON info.invoiceid = i.invoiceid
            WHERE info.invoiceid = $1
            `, [inputInvoices[i]]);
            const invoiceId = invoices.rows[0].invoiceid;
            const invoice  = invoices.rows[0].invoice;
            const name = invoices.rows[0].invoicename;
            const owner = invoices.rows[0].owner;
            const amount = invoices.rows[0].amount;
            const date = invoices.rows[0].date;

            await client.query(`
            INSERT INTO invoices (invoiceid, invoice) 
            VALUES ($1, $2)`,
            [invoiceId, invoice]);

            await client.query(`
            INSERT INTO invoiceInfo (invoiceId, invoiceName, owner, amount, date)
            VALUES ($1, $2, $3, $4, $5)
            `, [invoiceId, name, owner, amount, date]);

            // Remove from current invoices
            await client.query(`
            DELETE FROM trash
            WHERE invoiceid = $1
            `, [inputInvoices[i]]);

            // Remove from current invoice information
            await client.query(`
            DELETE FROM trashinfo
            WHERE invoiceid = $1
            `, [inputInvoices[i]]);
        }
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

module.exports = { listTrashItems, deleteTrash, restoreTrash, listTrashItemsV2, deleteTrashV2, restoreTrashV2, deleteTrashes, restoreTrashes };
