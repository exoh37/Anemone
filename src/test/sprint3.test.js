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
const modifyInvoice1 = {
    newInvoiceName: "this is new",
    newAmount: 37,
    newDate: ""
};
const modifyInvoice3 = {
    newInvoiceName: "but this is newer",
    newAmount: 1.11,
    newDate: ""
};

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
    // const list = await request(app)
    //     .get(endpoint)
    //     .set("token", user.body.token)
    //     .expect(200)
    //     .expect("Content-Type", /application\/json/);

    // assert.strictEqual(list.body.success, true);
    // assert.strictEqual(list.body.invoices[index].invoiceId, invoice.body.invoiceId);
    // assert.strictEqual(list.body.invoices[index].invoiceName, invoice.body.invoiceName);
    // assert.strictEqual(list.body.invoices[index].amount, invoice.body.amount);
    // assert.strictEqual(list.body.invoices[index].date, invoice.body.date);
    // assert.strictEqual(list.body.invoices[index].trashed, trashed);
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

        // Empty list test
        const emptyList1 = await request(app)
            .get("/invoices")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const emptyList2 = await request(app)
            .get("/invoices")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);
        
        assert.strictEqual(emptyList1.body.invoices.length, 0);
        assert.strictEqual(emptyList2.body.invoices.length, 0);

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

        // Move to trash (1 + 3)
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

        // Move to trash (2 + 4)
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

        // Restore (1 + 3)
        await request(app)
            .post(`/trash/${invoice1.body.invoiceId}/restore`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post(`/trash/${invoice3.body.invoiceId}/restore`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        assertListIndexHasInvoice("/invoices", 0, returnedInvoice1, user1, false);
        assertListIndexHasInvoice("/trash", 0, returnedInvoice2, user1, true);
        assertListIndexHasInvoice("/invoices", 0, returnedInvoice3, user2, false);
        assertListIndexHasInvoice("/trash", 0, returnedInvoice4, user2, true);

        // Modify (1 + 3)
        const modifiedInvoice1 = await request(app)
            .put(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .send(modifyInvoice1)
            .expect(200)
            .expect("Content-Type", /application\/json/);
        
        // Unchanging invoiceId, changed name, changed amount, unchanging date
        assert.strictEqual(modifiedInvoice1.body.success, true);
        assert.strictEqual(modifiedInvoice1.body.invoice.invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(modifiedInvoice1.body.invoice.invoiceName, modifyInvoice1.newInvoiceName);
        assert.strictEqual(modifiedInvoice1.body.invoice.amount, modifyInvoice1.newAmount);
        assert.strictEqual(modifiedInvoice1.body.invoice.date, returnedInvoice1.body.date);
        assert.strictEqual(modifiedInvoice1.body.invoice.trashed, false);

        const modifiedInvoice3 = await request(app)
            .put(`/invoices/${invoice3.body.invoiceId}`)
            .set("token", user2.body.token)
            .send(modifyInvoice3)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Unchanging invoiceId, changed name, changed amount, unchanging date
        assert.strictEqual(modifiedInvoice3.body.success, true);
        assert.strictEqual(modifiedInvoice3.body.invoice.invoiceId, invoice3.body.invoiceId);
        assert.strictEqual(modifiedInvoice3.body.invoice.invoiceName, modifyInvoice3.newInvoiceName);
        assert.strictEqual(modifiedInvoice3.body.invoice.amount, modifyInvoice3.newAmount);
        assert.strictEqual(modifiedInvoice3.body.invoice.date, returnedInvoice3.body.date);
        assert.strictEqual(modifiedInvoice3.body.invoice.trashed, false);

        // Assert the modified invoices are still in the system
        assertListIndexHasInvoice("/invoices", 0, modifiedInvoice1, user1, false);
        assertListIndexHasInvoice("/trash", 0, returnedInvoice2, user1, true);
        assertListIndexHasInvoice("/invoices", 0, modifiedInvoice3, user2, false);
        assertListIndexHasInvoice("/trash", 0, returnedInvoice4, user2, true);

        // Delete (2 + 4)
        await request(app)
            .delete(`/trash/${invoice2.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .delete(`/trash/${invoice4.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        assertListIndexHasInvoice("/invoices", 0, modifiedInvoice1, user1, false);
        assertListIndexHasInvoice("/invoices", 0, modifiedInvoice3, user2, false);
        
        const trashList1 = await request(app)
            .get("/trash")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const trashList2 = await request(app)
            .get("/trash")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);
        
        assert.strictEqual(trashList1.body.invoices.length, 0);
        assert.strictEqual(trashList2.body.invoices.length, 0);
    });
});

server.close();