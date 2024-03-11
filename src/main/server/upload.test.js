const request = require("supertest");
const app = require("./index"); 

const invoiceUpload = require("./invoiceUpload");

describe("POST /invoices", () => {
    it("should return status 200 and success message on successful upload", async () => {
        const res = await request(app)
            .post("/invoices")
            .send({ file: "{\"amount\": \"500\"}" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({"invoice": {"amount": expect.any(String), "date": expect.any(Number), "invoiceId": expect.any(Number), "invoiceName": "Name", "trashed": false}, "success": true});
        invoiceUpload.clear();
    });

    it("should return status 400 and error message on failed upload", async () => {
        const res = await request(app)
            .post("/invoices")
            .send();

        expect(res.status).toBe(400);
        expect(res.body).toEqual({"message": "Error uploading file: Unexpected token u in JSON at position 0", "success": false});
        invoiceUpload.clear();
    });
 
});
