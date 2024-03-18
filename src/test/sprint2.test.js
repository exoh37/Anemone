const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";
const invalidUsername = "name with space";
const mockInvoice1 = { file: { amount: 123.45 } };
const mockInvoice2 = { "file": "{\"amount\": \"123.45\"}" };
const invalidToken = "thisIsAnInvalidToken";

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server"); 

describe("Sprint 2 system test(s)", function() {
    it("System Test", async function() {
        await request(app)
            .delete("/clear")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/users")
            .send({ username: invalidUsername, email: validEmail1, password: validPassword1 })
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Username 'name with space' contains a whitespace character"});
        
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

        await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword2 })
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Password does not match username '${validUsername1}'`});

        await request(app)
            .post("/users/login")
            .send({ username: validUsername2, password: validPassword1 })
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Password does not match username '${validUsername2}'`});

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
        
        // Using assert to check for each type
        assert.strictEqual(user2.body.success, true);
        assert.strictEqual(typeof user2.body.token, "string");

        const invoice1 = await request(app)
            .post("/invoices")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice1 })
            .expect(200);

        assert.strictEqual(invoice1.body.success, true);
        assert.strictEqual(typeof invoice1.body.invoiceId, "number");

        const invoice2 = await request(app)
            .post("/invoices")
            .set("token", user2.body.token)
            .send({ invoice: mockInvoice2 })
            .expect(200);

        assert.strictEqual(invoice2.body.success, true);
        assert.strictEqual(typeof invoice2.body.invoiceId, "number");

        await request(app)
            .get(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(403)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Not owner of this invoice '${invoice1.body.invoiceId}'`});

        await request(app)
            .get(`/invoices/${invoice2.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(403)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Not owner of this invoice '${invoice2.body.invoiceId}'`});

        const returnedInvoice1 = await request(app)
            .get(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);
        
        assert.strictEqual(returnedInvoice1.body.success, true);
        assert.strictEqual(returnedInvoice1.body.invoice.invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(returnedInvoice1.body.invoice.amount, mockInvoice1.file.amount);
        assert.strictEqual(returnedInvoice1.body.invoice.trashed, false);

        const returnedInvoice2 = await request(app)
            .get(`/invoices/${invoice2.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
        
        assert.strictEqual(returnedInvoice2.body.success, true);
        assert.strictEqual(returnedInvoice2.body.invoice.invoiceId, invoice2.body.invoiceId);
        assert.strictEqual(returnedInvoice2.body.invoice.amount, mockInvoice2.file.amount);
        assert.strictEqual(returnedInvoice2.body.invoice.trashed, false);

        await request(app)
            .get(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", invalidToken)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});
    });
});

server.close();
