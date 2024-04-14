const validUsername1 = "validUsername1",
    validUsername2 = "thisIsAValidName",
    validEmail1 = "test123@gmail.com",
    validEmail2 = "123test@gmail.com",
    validPassword1 = "ThisIsSecure!123",
    validPassword2 = "lessSecure2@",

    mockInvoice1 = { file: { amount: 125.45,
        title: "Business" } },
    mockInvoice2 = { file: { amount: 130.05,
        title: "NotBusiness" } },
    filteredWord = "Business",
    emptyString = "",
    invalidToken = 0;
const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server");

describe("Testing filtering of invoices", function() {
    it("General tests for invoice filtering", async function() {
        // Setup user and login process
        await request(app)
            .delete("/clear")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/users")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/users")
            .send({ username: validUsername2, email: validEmail2, password: validPassword2 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        const user1 = await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Using assert to check for each type
        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");

        const user2 = await request(app)
            .post("/users/login")
            .send({ username: validUsername2, password: validPassword2 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // 1: create invoice1
        const invoice1 = await request(app)
            .post("/invoices")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice1 })
            .expect(200);

        assert.strictEqual(invoice1.body.success, true);
        assert.strictEqual(typeof invoice1.body.invoiceId, "number");

        // 1: create invoice2
        const invoice2 = await request(app)
            .post("/invoices")
            .set("token", user2.body.token)
            .send({ invoice: mockInvoice2 })
            .expect(200);

        assert.strictEqual(invoice2.body.success, true);
        assert.strictEqual(typeof invoice2.body.invoiceId, "number");

        // Success case
        const filteredInvoice1 = await request(app)
            .get(`/invoices/search/${filteredWord}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(filteredInvoice1.body.success, true);
        assert.strictEqual(filteredInvoice1.body.filteredInvoices.invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(filteredInvoice1.body.filteredInvoices.invoiceName, mockInvoice1.file.title);
        assert.strictEqual(filteredInvoice1.body.filteredInvoices.trashed, false);

        // 401 error case invalid token
        await request(app)
            .get(`/invoices/search/${filteredWord}`)
            .set("token", invalidToken)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // 401 error case no token
        await request(app)
            .get(`/invoices/search/${filteredWord}`)
            .set("token", emptyString)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

    });
});

server.close();