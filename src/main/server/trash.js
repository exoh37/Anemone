const other = require("./other.js");

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

    const jsonData = other.getInvoiceData();

    // This is assuming that the invoices are appended to the end of the JSON array as
    // they get deleted so that the invoices array can be returned in the correct order
    let invoices = jsonData.filter(invoice => invoice.owner === tokenValidation.username);
    invoices = invoices.map(obj => {
        // Remove owner from the array
        const { owner, ...rest } = obj;
        return rest;
    })

    return {
        code: 200,
        ret: {
            success: true,
            invoices: invoices
        }
    }
}

module.exports = { listTrashItems };
