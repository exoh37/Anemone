const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";
const mockInvoice1 = { file: { amount: 123.45 } };
const mockInvoice2 = { file: { amount: 42.42 } };
const mockInvoice3 = { file: { amount: 999.99 } };
const mockInvoice4 = { file: { amount: 67.89 } };
const invalidToken = "thisIsAnInvalidToken";

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server");

/* Asserts that the nth index of a an invoiceList contains a certain invoice.
 * endpoint: Route specified to test
 * index: Number referring to the index in the invoice array
 * invoice: Must be the unmodified returned body of a single invoice retrieval
 * user: Must be the unmodified returned body of a login, so it contains a token
 * trashed: Boolean value for whether an invoice should be trashed or not
 */
async function assertListIndexHasInvoice(endpoint, index, invoice, user, trashed) {
    const list = await request(app)
        .get(endpoint)
        .set("token", user.body.token)
        .expect(200)
        .expect("Content-Type", /application\/json/);

    assert.strictEqual(list.body.success, true);
    assert.strictEqual(list.body.invoices[index].invoiceId, invoice.body.invoiceId);
    assert.strictEqual(list.body.invoices[index].invoiceName, invoice.body.invoiceName);
    assert.strictEqual(list.body.invoices[index].amount, invoice.body.amount);
    assert.strictEqual(list.body.invoices[index].date, invoice.body.date);
    assert.strictEqual(list.body.invoices[index].trashed, trashed);
}

describe("Sprint 3 system test(s)", function() {
    it("System Test", async function() {
        await request(app)
            .delete("/clear");

        // User Setup
        await request(app)
            .post("/users")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 });
        
        await request(app)
            .post("/users")
            .send({ username: validUsername2, email: validEmail2, password: validPassword2 });

        const user1 = await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword1 });

        const user2 = await request(app)
            .post("/users/login")
            .send({ username: validUsername2, password: validPassword2 });

        // Upload invoices: invoice1 + invoice2 belong to user1, invoice3 + invoice4 belong to user2
        const invoice1 = await request(app)
            .post("/invoices")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice1 });

        const returnedInvoice1 = await request(app)
            .get(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const invoice2 = await request(app)
            .post("/invoices")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice2 });

        const returnedInvoice2 = await request(app)
            .get(`/invoices/${invoice2.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const invoice3 = await request(app)
            .post("/invoices")
            .set("token", user2.body.token)
            .send({ invoice: mockInvoice3 });

        const returnedInvoice3 = await request(app)
            .get(`/invoices/${invoice3.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const invoice4 = await request(app)
            .post("/invoices")
            .set("token", user2.body.token)
            .send({ invoice: mockInvoice4 });

        const returnedInvoice4 = await request(app)
            .get(`/invoices/${invoice4.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Deleting 1 invoice from each user
        await request(app)
            .delete(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .delete(`/invoices/${invoice3.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        assertListIndexHasInvoice("/trash", 0, returnedInvoice1, user1, true);
        assertListIndexHasInvoice("/invoices", 0, returnedInvoice2, user1, false);
        assertListIndexHasInvoice("/trash", 0, returnedInvoice3, user2, true);
        assertListIndexHasInvoice("/invoices", 0, returnedInvoice4, user2, false);

        // Deleting other invoice from each user
        await request(app)
            .delete(`/invoices/${invoice2.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .delete(`/invoices/${invoice4.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        assertListIndexHasInvoice("/trash", 0, returnedInvoice1, user1, true);
        assertListIndexHasInvoice("/trash", 1, returnedInvoice2, user1, true);
        assertListIndexHasInvoice("/trash", 0, returnedInvoice3, user2, true);
        assertListIndexHasInvoice("/trash", 1, returnedInvoice4, user2, true);

        // Restore
    });
});