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

module.exports = { listTrashItems };
