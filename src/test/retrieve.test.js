const validUsername1 = "validUsername1",
    validUsername2 = "thisIsAValidName",
    validEmail1 = "test123@gmail.com",
    validEmail2 = "123test@gmail.com",
    validPassword1 = "ThisIsSecure!123",
    validPassword2 = "lessSecure2@";

const mockInvoice1 = `
    <invoices>
        <invoice>
            <invoiceName>Invoice 1</invoiceName>
            <amount>123.45</amount>
            <date>2024-04-08</date>
            <trashed>false</trashed>
            <owner>validUsername1</owner>
        </invoice>
    </invoices>
`;

const mockInvoice2 = `
    <invoices>
        <invoice>
            <invoiceName>Invoice 2</invoiceName>
            <amount>543.21</amount>
            <date>2024-04-08</date>
            <trashed>false</trashed>
            <owner>thisIsAValidName</owner>
        </invoice>
    </invoices>
`;

const falseId = 0;

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server");

describe("Testing route GET /invoice/{invoiceId}", function() {
    it("tests for Retrieving Invoices", async function() {
        // Setup user and login process
        await request(app)
            .delete("/clear2")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/users2")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/users2")
            .send({ username: validUsername2, email: validEmail2, password: validPassword2 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        const user1 = await request(app)
                .post("/users/login2")
                .send({ username: validUsername1, password: validPassword1 })
                .expect(200)
                .expect("Content-Type", /application\/json/),

            user2 = await request(app)
                .post("/users/login2")
                .send({ username: validUsername2, password: validPassword2 })
                .expect(200)
                .expect("Content-Type", /application\/json/);

        // Using assert to check for each type
        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");

        // 1: create invoice
        const invoice1 = await request(app)
            .post("/invoices2")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice1 })
            .expect(200);

        assert.strictEqual(invoice1.body.success, true);
        assert.strictEqual(typeof invoice1.body.invoiceId, "number");

        // Unsuccessful retrieve as wrong user
        await request(app)
            .get(`/invoices2/${invoice1.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(403)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Not owner of this invoice '${invoice1.body.invoiceId}'`});

        // Unsuccessful retrieve as no such ID
        await request(app)
            .get(`/invoices2/${falseId}`)
            .set("token", user2.body.token)
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `invoiceId '${falseId}' does not refer to an existing invoice`});

        // Unsuccessful retrieve as no such Token
        await request(app)
            .get(`/invoices2/${invoice1.body.invoiceId}`)
            .set("token", falseId)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // Check successful retrieve
        const returnedInvoice1 = await request(app)
            .get(`/invoices2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(returnedInvoice1.body.success, true);
        assert.strictEqual(returnedInvoice1.body.invoice.invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(returnedInvoice1.body.invoice.amount, 123.45);
        assert.strictEqual(returnedInvoice1.body.invoice.trashed, false);

        // 2: test another invoice
        const invoice2 = await request(app)
            .post("/invoices2")
            .set("token", user2.body.token)
            .send({ invoice: mockInvoice2 })
            .expect(200);

        assert.strictEqual(invoice2.body.success, true);
        assert.strictEqual(typeof invoice2.body.invoiceId, "number");

        // Wrong user case
        await request(app)
            .get(`/invoices2/${invoice2.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(403)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Not owner of this invoice '${invoice2.body.invoiceId}'`});

        // Valid case
        const returnedInvoice2 = await request(app)
            .get(`/invoices2/${invoice2.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(returnedInvoice2.body.success, true);
        assert.strictEqual(returnedInvoice2.body.invoice.invoiceId, invoice2.body.invoiceId);
        assert.strictEqual(returnedInvoice2.body.invoice.amount, 543.21);
        assert.strictEqual(returnedInvoice2.body.invoice.trashed, false);

    });
});

server.close();