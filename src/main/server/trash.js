const { json } = require("express");
const auth = require("./auth.js");
const other = require("./other.js");



function deleteTrash(invoiceId,token) { 
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
    const invoiceIndex = jsonData.findIndex(invoice => invoice.invoiceId === parseInt(invoiceId));
    if (invoice === undefined) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `invoiceId '${invoiceId}' does not refer to an existing invoice`
            }
        };
    } else if (invoice.trashed !== true) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `invoiceId refers to an invoice not in the trash '${invoiceId}'`
            }
        };
    } 

    else if (invoice.owner !== tokenValidation.username) {
        return {
            code: 403,
            ret: {
                success: false,
                error: "Valid token and invoiceId are provided, but user is not owner of this invoice"
            }
        };
    }

    jsonData.splice(invoiceIndex, 1);
    
    other.setInvoiceData(jsonData);
    return {success: true};
}

module.exports = { deleteTrash };