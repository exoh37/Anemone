const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validUsername3 = "thisIsAValidName123";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validEmail3 = "t1e2s3t@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";
const validPassword3 = "ThisIsSecure!4215";

const XML = require("./sampleXML");
const falseId = 0;

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server");

//tests
//1. unsuccessful, invalid token
//2. unsuccessful, invalid invoiceId
//3. unsuccessful, invalid invoiceId as invoice is not in trash
//4. unsuccessful, given token is not owner of requested invoiceid
//5. unsuccessful, duplicate requested invoices
//6. successfully trashing all invoices respective to the user

describe("Testing route DELETE /trash/{invoiceIds}/delete", function() {
    it("Delete from trash Unit Tests", async function() {
        await request(app)
            .delete("/clearV2")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        // user registered
        await request(app)
            .post("/usersV2")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/usersV2")
            .send({ username: validUsername2, email: validEmail2, password: validPassword2 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/usersV2")
            .send({ username: validUsername3, email: validEmail3, password: validPassword3 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        // user logged in
        const user1 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");

        const user2 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername2, password: validPassword2 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(user2.body.success, true);
        assert.strictEqual(typeof user2.body.token, "string");

        // invoice created
        const invoice1 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice1 })
            .expect(200);

        assert.strictEqual(invoice1.body.success, true);
        assert.strictEqual(typeof invoice1.body.invoiceId, "number");

        const invoice2 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice2 })
            .expect(200);

        assert.strictEqual(invoice2.body.success, true);
        assert.strictEqual(typeof invoice2.body.invoiceId, "number");

        const invoice3 = await request(app)
            .post("/invoicesV2")
            .set("token", user2.body.token)
            .send({ invoice: XML.mockInvoice1 })
            .expect(200);

        assert.strictEqual(invoice1.body.success, true);
        assert.strictEqual(typeof invoice1.body.invoiceId, "number");

        const invoice4 = await request(app)
            .post("/invoicesV2")
            .set("token", user2.body.token)
            .send({ invoice: XML.mockInvoice2 })
            .expect(200);

        assert.strictEqual(invoice2.body.success, true);
        assert.strictEqual(typeof invoice2.body.invoiceId, "number");

        const invoice5 = await request(app)
            .post("/invoicesV2")
            .set("token", user2.body.token)
            .send({ invoice: XML.mockInvoice3 })
            .expect(200);

        assert.strictEqual(invoice3.body.success, true);
        assert.strictEqual(typeof invoice3.body.invoiceId, "number");

        // unsuccessful retrieve as no such Token
        await request(app)
            .delete(`/trash/${[invoice1.body.invoiceId, invoice2.body.invoiceId]}/delete`)
            .set("token", falseId)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // unsuccessful, invoiceid does not exist
        await request(app)
            .delete(`/trash/${[falseId]}/delete`)
            .set("token", user1.body.token)
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `${falseId} does not refer to an existing invoice`});

        // unsuccessful, duplicate invoiceid
        await request(app)
            .delete(`/invoices/${[invoice1.body.invoiceId, invoice1.body.invoiceId]}/trash`)
            .set("token", user1.body.token)
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `${invoice1.body.invoiceId} is a duplicate`});

        // Trash all invoices for user1
        await request(app)
            .delete(`/invoices/${[invoice1.body.invoiceId, invoice2.body.invoiceId]}/trash`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // unsuccessful, valid token and invoiceId are provided, but user is not owner of at least 1 invoice
        await request(app)
            .delete(`/trash/${[invoice1.body.invoiceId]}/delete`)
            .set("token", user2.body.token)
            .expect(403)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Not owner of this invoice '${invoice1.body.invoiceId}'`});

        // Trash all invoices for user1
        await request(app)
            .delete(`/invoices/${[invoice3.body.invoiceId, invoice4.body.invoiceId, invoice5.body.invoiceId]}/trash`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Trash list for user1 should have 2 invoices
        const trashList1 = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200);

        assert.strictEqual(trashList1.body.success, true);
        assert.strictEqual(trashList1.body.invoices[0].invoiceid, invoice1.body.invoiceId);
        assert.strictEqual(trashList1.body.invoices[0].invoicename, "Invoice 1");
        assert.strictEqual(trashList1.body.invoices[0].amount, 123.45);
        assert.strictEqual(trashList1.body.invoices[1].invoiceid, invoice2.body.invoiceId);
        assert.strictEqual(trashList1.body.invoices[1].invoicename, "Invoice 2");
        assert.strictEqual(trashList1.body.invoices[1].amount, 543.21);

        // Delete all trashed invoices for user1
        await request(app)
            .delete(`/trash/${[invoice1.body.invoiceId, invoice2.body.invoiceId]}/delete`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({ success: true });

        // Check that trashed invoices have been deleted
        await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200)
            .expect({
                success: true,
                invoices: []
            });

        // Delete some but not all trashed invoices for user2
        await request(app)
            .delete(`/trash/${[invoice3.body.invoiceId, invoice4.body.invoiceId]}/delete`)
            .set("token", user2.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({ success: true });

        // Trashed invoice list for user2 should still have one invoice
        const trashList2 = await request(app)
            .get("/trashV2")
            .set("token", user2.body.token)
            .expect(200);

        assert.strictEqual(trashList2.body.success, true);
        assert.strictEqual(trashList2.body.invoices[0].invoiceid, invoice5.body.invoiceId);
        assert.strictEqual(trashList2.body.invoices[0].invoicename, "Invoice 3");
        assert.strictEqual(trashList2.body.invoices[0].amount, 999.99);
    });
});

server.close();
