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

describe("Testing route POST /trash/{invoiceIds}/restore", function() {
    let user1, user2, user3;
    let invoice1, invoice2, invoice3, invoice4;

    beforeEach(async function() {
        // Clear data before running any tests
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
        user1 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        user2 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername2, password: validPassword2 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        user3 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername3, password: validPassword3 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");

        // invoices created
        invoice1 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice1 })
            .expect(200);

        assert.strictEqual(invoice1.body.success, true);
        assert.strictEqual(typeof invoice1.body.invoiceId, "number");

        invoice2 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice2 })
            .expect(200);

        assert.strictEqual(invoice2.body.success, true);
        assert.strictEqual(typeof invoice2.body.invoiceId, "number");

        invoice3 = await request(app)
            .post("/invoicesV2")
            .set("token", user2.body.token)
            .send({ invoice: XML.mockInvoice3 })
            .expect(200);

        assert.strictEqual(invoice3.body.success, true);
        assert.strictEqual(typeof invoice3.body.invoiceId, "number");

        invoice4 = await request(app)
            .post("/invoicesV2")
            .set("token", user3.body.token)
            .send({ invoice: XML.mockInvoice4 })
            .expect(200);

        assert.strictEqual(invoice4.body.success, true);
        assert.strictEqual(typeof invoice4.body.invoiceId, "number");
    });

    it("Valid Input: Restoring from trash successfully", async function() {
        // Move to trash
        await request(app)
            .delete(`/invoices/${[invoice1.body.invoiceId, invoice2.body.invoiceId]}/trash`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        await request(app)
            .delete(`/invoices/${[invoice4.body.invoiceId]}/trash`)
            .set("token", user3.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Restore all invoices for user1
        await request(app)
            .post(`/trash/${[invoice1.body.invoiceId, invoice2.body.invoiceId]}/batch/restore`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        // Check the invoice has been restored
        const invoiceList = await request(app)
            .get("/invoicesV2")
            .set("token", user1.body.token)
            .expect(200);

        assert.strictEqual(invoiceList.body.success, true);
        assert.strictEqual(invoiceList.body.invoices[0].invoiceid, invoice1.body.invoiceId);
        assert.strictEqual(invoiceList.body.invoices[0].invoicename, "Invoice 1");
        assert.strictEqual(invoiceList.body.invoices[0].amount, 123.45);
        assert.strictEqual(invoiceList.body.invoices[1].invoiceid, invoice2.body.invoiceId);
        assert.strictEqual(invoiceList.body.invoices[1].invoicename, "Invoice 2");
        assert.strictEqual(invoiceList.body.invoices[1].amount, 543.21);

        const trashList = await request(app)
            .get("/trashV2")
            .set("token", user3.body.token)
            .expect(200);

        assert.strictEqual(trashList.body.success, true);
        assert.strictEqual(trashList.body.invoices[0].invoiceid, invoice4.body.invoiceId);
        assert.strictEqual(trashList.body.invoices[0].invoicename, "Invoice 4");
        assert.strictEqual(trashList.body.invoices[0].amount, 67.89);
    });

    it("Invalid Input: Token is empty or invalid", async function() {
        await request(app)
            .delete(`/invoicesV2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token);

        // Invalid token
        await request(app)
            .post(`/trash/${invoice1.body.invoiceId}/batch/restore`)
            .set("token", falseId)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // Empty token
        await request(app)
            .post(`/trash/${invoice1.body.invoiceId}/batch/restore`)
            .set("token", "")
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});
    });

    it("Invalid Input: Valid token and invoiceId are provided, but user is not owner of this invoice", async function() {
        await request(app)
            .delete(`/invoicesV2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token);

        await request(app)
            .delete(`/invoicesV2/${invoice3.body.invoiceId}`)
            .set("token", user2.body.token);

        // Invalid owner
        await request(app)
            .post(`/trash/${[invoice1.body.invoiceId]}/batch/restore`)
            .set("token", user2.body.token)
            .expect(403)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error" : `Not owner of this invoice '${invoice1.body.invoiceId}'`});
    });

    it("Invalid Input: invoiceId does not refer to an existing invoice", async function() {
        // No such invoice
        await request(app)
            .post(`/trash/${falseId}/batch/restore`)
            .set("token", user1.body.token)
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error" : `invoiceId '${falseId}' does not refer to an existing invoice`});
    });

    it("Invalid Input: invoiceId refers to an existing invoice not in trash", async function() {
        await request(app)
            .post(`/trash/${[invoice1.body.invoiceId]}/batch/restore`)
            .set("token", user1.body.token)
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error" : `invoiceId '${invoice1.body.invoiceId}' refers to an invoice not in the trash`});
    });

    it("Invalid Input: Duplicate invoiceIds", async function() {
        await request(app)
            .delete(`/invoicesV2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token);

        await request(app)
            .post(`/trash/${[invoice1.body.invoiceId, invoice1.body.invoiceId]}/batch/restore`)
            .set("token", user1.body.token)
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error" : `'${invoice1.body.invoiceId}' is a duplicate invoiceId`});
    });

});

server.close();
