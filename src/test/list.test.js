const validUsername1 = "validUsername1";
const validEmail1 = "test123@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const mockInvoice1 = { file: { amount: 123.45 } };
const mockInvoice2 = { file: { amount: 543.21 } };

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");

describe("Invoice List", function() {
    let user;

    beforeEach(async function() {
        // Clear data before running any tests
        await request(app)
            .delete("/clear")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/users")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 })
            .expect(200);

        user = await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200);
    });

    it("Valid Input: Return the an emtpy list of invoices", async function() {
        await request(app)
            .get("/invoices")
            .set("token", user.body.token)
            .expect(200)
            .expect({
                success:true, 
                invoices: []
            });
    });

    it("Valid Input: Return the a populated list of invoices", async function() {
        const invoice1 = await request(app)
            .post("/invoices")
            .set("token", user.body.token)
            .send({ invoice: mockInvoice1 })
            .expect(200);

        let invoicelist = await request(app)
            .get("/invoices")
            .set("token", user.body.token)
            .expect(200);

        assert.strictEqual(invoicelist.body.success, true);
        assert.strictEqual(invoicelist.body.invoices[0].invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(invoicelist.body.invoices[0].invoiceName, "PLACEHOLDER_NAME");
        assert.strictEqual(invoicelist.body.invoices[0].amount, mockInvoice1.file.amount);
        assert.strictEqual(invoicelist.body.invoices[0].trashed, false);

        const invoice2 = await request(app)
            .post("/invoices")
            .set("token", user.body.token)
            .send({ invoice: mockInvoice2 })
            .expect(200);

        invoicelist = await request(app)
            .get("/invoices")
            .set("token", user.body.token)
            .expect(200);

        assert.strictEqual(invoicelist.body.success, true);
        assert.strictEqual(invoicelist.body.invoices[0].invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(invoicelist.body.invoices[0].invoiceName, "PLACEHOLDER_NAME");
        assert.strictEqual(invoicelist.body.invoices[0].amount, mockInvoice1.file.amount);
        assert.strictEqual(invoicelist.body.invoices[0].trashed, false);
        assert.strictEqual(invoicelist.body.invoices[1].invoiceId, invoice2.body.invoiceId);
        assert.strictEqual(invoicelist.body.invoices[1].invoiceName, "PLACEHOLDER_NAME");
        assert.strictEqual(invoicelist.body.invoices[1].amount, mockInvoice2.file.amount);
        assert.strictEqual(invoicelist.body.invoices[1].trashed, false);
    });

    it("Invalid Input: Invalid token", async function() {
        await request(app)
            .get("/invoices")
            .set("token", user.body.token + "1")
            .expect(401)
            .expect({
                success:false, 
                "error": "Token is empty or invalid"
            });
    });

    it("Invalid Input: Empty token", async function() {
        await request(app)
            .get("/invoices")
            .set("token", "")
            .expect(401)
            .expect({
                success:false, 
                "error": "Token is empty or invalid"
            });
    });
});
