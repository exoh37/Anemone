const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";
const XML = require("./sampleXML");
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
 * list: Returned body of a list route
 * index: Number referring to the index in the invoice array
 * invoice: Must be the unmodified returned body of a single invoice retrieval
 */
async function assertListIndexHasInvoice(list, index, invoice) {
    assert.strictEqual(list.body.success, true);
    assert.strictEqual(list.body.invoices[index].invoiceid, invoice.body.invoiceId);
    assert.strictEqual(list.body.invoices[index].invoicename, invoice.body.invoiceName);
    assert.strictEqual(list.body.invoices[index].amount, invoice.body.amount);
    assert.strictEqual(list.body.invoices[index].date, invoice.body.date);
}

describe("Sprint 3 system test(s)", function() {
    it("System Test", async function() {
        let invoiceList;

        await request(app)
            .delete("/clearV2");

        // User Setup
        await request(app)
            .post("/usersV2")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 });

        await request(app)
            .post("/usersV2")
            .send({ username: validUsername2, email: validEmail2, password: validPassword2 });

        const user1 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 });

        const user2 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername2, password: validPassword2 });

        // Empty list test
        const emptyList1 = await request(app)
            .get("/invoicesV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const emptyList2 = await request(app)
            .get("/invoicesV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(emptyList1.body.invoices.length, 0);
        assert.strictEqual(emptyList2.body.invoices.length, 0);

        // Upload invoices: invoice1 + invoice2 belong to user1, invoice3 + invoice4 belong to user2
        const invoice1 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice1 });

        const returnedInvoice1 = await request(app)
            .get(`/invoicesV2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const invoice2 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice2 });

        const returnedInvoice2 = await request(app)
            .get(`/invoicesV2/${invoice2.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const invoice3 = await request(app)
            .post("/invoicesV2")
            .set("token", user2.body.token)
            .send({ invoice: XML.mockInvoice3 });

        const returnedInvoice3 = await request(app)
            .get(`/invoicesV2/${invoice3.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const invoice4 = await request(app)
            .post("/invoicesV2")
            .set("token", user2.body.token)
            .send({ invoice: XML.mockInvoice4 });

        const returnedInvoice4 = await request(app)
            .get(`/invoicesV2/${invoice4.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Move to trash (1 + 3)
        await request(app)
            .delete(`/invoicesV2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .delete(`/invoicesV2/${invoice3.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        invoiceList = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice1);

        invoiceList = await request(app)
            .get("/invoicesV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice2);

        invoiceList = await request(app)
            .get("/trashV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice3, user2);

        invoiceList = await request(app)
            .get("/invoicesV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice4, user2);

        // Move to trash (2 + 4)
        await request(app)
            .delete(`/invoicesV2/${invoice2.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .delete(`/invoicesV2/${invoice4.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        invoiceList = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice1);

        invoiceList = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 1, returnedInvoice2);

        invoiceList = await request(app)
            .get("/trashV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice3);

        invoiceList = await request(app)
            .get("/trashV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 1, returnedInvoice4);

        // Restore (1 + 3)
        await request(app)
            .post(`/trashV2/${invoice1.body.invoiceId}/restore`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post(`/trashV2/${invoice3.body.invoiceId}/restore`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        invoiceList = await request(app)
            .get("/invoicesV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice1);

        invoiceList = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice2);

        invoiceList = await request(app)
            .get("/invoicesV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice3);

        invoiceList = await request(app)
            .get("/trashV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice4);

        // Modify (1 + 3)
        const modifiedInvoice1 = await request(app)
            .put(`/invoicesV2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .send(modifyInvoice1)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Unchanging invoiceId, unchanged name, changed amount, unchanging date
        assert.strictEqual(modifiedInvoice1.body.success, true);
        assert.strictEqual(modifiedInvoice1.body.invoice.invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(modifiedInvoice1.body.invoice.invoiceName, returnedInvoice1.body.invoice.invoiceName);
        assert.strictEqual(modifiedInvoice1.body.invoice.amount, modifyInvoice1.newAmount);
        assert.strictEqual(modifiedInvoice1.body.invoice.date, returnedInvoice1.body.invoice.date);

        const modifiedInvoice3 = await request(app)
            .put(`/invoicesV2/${invoice3.body.invoiceId}`)
            .set("token", user2.body.token)
            .send(modifyInvoice3)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Unchanging invoiceId, unchanged name, changed amount, unchanging date
        assert.strictEqual(modifiedInvoice3.body.success, true);
        assert.strictEqual(modifiedInvoice3.body.invoice.invoiceId, invoice3.body.invoiceId);
        assert.strictEqual(modifiedInvoice3.body.invoice.invoiceName, returnedInvoice3.body.invoice.invoiceName);
        assert.strictEqual(modifiedInvoice3.body.invoice.amount, modifyInvoice3.newAmount);
        assert.strictEqual(modifiedInvoice3.body.invoice.date, returnedInvoice3.body.invoice.date);

        // Assert the modified invoices are still in the system

        invoiceList = await request(app)
            .get("/invoicesV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, modifiedInvoice1);

        invoiceList = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice2);

        invoiceList = await request(app)
            .get("/invoicesV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, modifiedInvoice3);

        invoiceList = await request(app)
            .get("/trashV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, returnedInvoice4);

        // Delete (2 + 4)
        await request(app)
            .delete(`/trashV2/${invoice2.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .delete(`/trashV2/${invoice4.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        invoiceList = await request(app)
            .get("/invoicesV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, modifiedInvoice1);

        invoiceList = await request(app)
            .get("/invoicesV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assertListIndexHasInvoice(invoiceList, 0, modifiedInvoice3);

        const trashList1 = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const trashList2 = await request(app)
            .get("/trashV2")
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(trashList1.body.invoices.length, 0);
        assert.strictEqual(trashList2.body.invoices.length, 0);
    });
});

server.close();