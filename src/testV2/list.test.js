const validUsername1 = "validUsername1";
const validEmail1 = "test123@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const XML = require("./sampleXML");

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");

describe("Testing route GET /invoicesV2", function() {
    let user;

    beforeEach(async function() {
        // Clear data before running any tests
        await request(app)
            .delete("/clearV2")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/usersV2")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 })
            .expect(200);

        user = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200);
    });

    it("Valid Input: Return the an empty list of invoices", async function() {
        await request(app)
            .get("/invoicesV2")
            .set("token", user.body.token)
            .expect(200)
            .expect({
                success: true,
                invoices: []
            });
    });

    it("Valid Input: Return the a populated list of invoices", async function() {
        const invoice1 = await request(app)
            .post("/invoicesV2")
            .set("token", user.body.token)
            .send({ invoice: XML.mockInvoice1 })
            .expect(200);

        let invoicelist = await request(app)
            .get("/invoicesV2")
            .set("token", user.body.token)
            .expect(200);

        assert.strictEqual(invoicelist.body.success, true);
        assert.strictEqual(invoicelist.body.invoices[0].invoiceid, invoice1.body.invoiceId);
        assert.strictEqual(invoicelist.body.invoices[0].invoicename, "Invoice 1");
        assert.strictEqual(invoicelist.body.invoices[0].amount, 123.45);

        const invoice2 = await request(app)
            .post("/invoicesV2")
            .set("token", user.body.token)
            .send({ invoice: XML.mockInvoice2 })
            .expect(200);

        invoicelist = await request(app)
            .get("/invoicesV2")
            .set("token", user.body.token)
            .expect(200);

        assert.strictEqual(invoicelist.body.success, true);
        assert.strictEqual(invoicelist.body.invoices[0].invoiceid, invoice1.body.invoiceId);
        assert.strictEqual(invoicelist.body.invoices[0].invoicename, "Invoice 1");
        assert.strictEqual(invoicelist.body.invoices[0].amount, 123.45);
        assert.strictEqual(invoicelist.body.invoices[1].invoiceid, invoice2.body.invoiceId);
        assert.strictEqual(invoicelist.body.invoices[1].invoicename, "Invoice 2");
        assert.strictEqual(invoicelist.body.invoices[1].amount, 543.21);
    });

    it("Invalid Input: Invalid token", async function() {
        await request(app)
            .get("/invoicesV2")
            .set("token", user.body.token + "1")
            .expect(401)
            .expect({
                success: false,
                "error": "Token is empty or invalid"
            });
    });

    it("Invalid Input: Empty token", async function() {
        await request(app)
            .get("/invoicesV2")
            .set("token", "")
            .expect(401)
            .expect({
                success: false,
                "error": "Token is empty or invalid"
            });
    });
});
