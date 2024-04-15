const request = require("supertest");
const validation = "https://sandc.vercel.app";

// Helper function for invoice validation
// Parameter file must be a string, and a string only
async function invoiceValidation(file) {
    // Check their server is online
    const response = await request(validation).get("/");

    if (response.status !== 200 ) {
        return {
            status: "offline"
        };
    } else {
        const invoice = await request(validation)
            .post("/validate")
            .set("Content-Type", "application/xml")
            .send(file);
        if (invoice.status !== 200) {
            return {
                status: "invalid"
            };
        } else {
            return {
                status: "valid"
            };
        }
    }
}

module.exports = { invoiceValidation };