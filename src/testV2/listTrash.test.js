const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";
const XML = require("./sampleXML");
const invalidToken = "thisIsAnInvalidToken";

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server");

describe("Testing route GET /trashV2", function() {
    beforeEach(async function() {
        // Clear data before running any tests
        await request(app)
            .delete("/clearV2")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});
    });

    it("Invalid token", async function() {
        await request(app)
            .post("/usersV2")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 });

        const user1 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 });

        const invoice1 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice1 });

        await request(app)
            .delete(`/invoicesV2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token);

        // Invalid token
        await request(app)
            .get("/trashV2")
            .set("token", invalidToken)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // Empty token
        await request(app)
            .get("/trashV2")
            .set("token", "")
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});
    });

    it("Valid usage with 1 invoice in trash", async function() {
        await request(app)
            .post("/usersV2")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 });

        const user1 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 });

        const invoice1 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice1 });

        await request(app)
            .delete(`/invoicesV2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token);

        const trashList = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200);

        assert.strictEqual(trashList.body.success, true);
        assert.strictEqual(trashList.body.invoices[0].invoiceid, invoice1.body.invoiceId);
        assert.strictEqual(trashList.body.invoices[0].amount, 123.45);
    });

    it("Valid usage with 2 invoices in trash (order check)", async function() {
        await request(app)
            .post("/usersV2")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 });

        const user1 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 });

        const invoice1 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice1 });

        const invoice2 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice2 });

        await request(app)
            .delete(`/invoicesV2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token);

        await request(app)
            .delete(`/invoicesV2/${invoice2.body.invoiceId}`)
            .set("token", user1.body.token);

        const trashList = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200);

        assert.strictEqual(trashList.body.success, true);
        assert.strictEqual(trashList.body.invoices[0].invoiceid, invoice1.body.invoiceId);
        assert.strictEqual(trashList.body.invoices[0].amount, 123.45);
        assert.strictEqual(trashList.body.invoices[1].invoiceid, invoice2.body.invoiceId);
        assert.strictEqual(trashList.body.invoices[1].amount, 543.21);
    });

    it("Valid usage with invoices deleted for 2 different users", async function() {
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

        const invoice1 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice1 });

        const invoice2 = await request(app)
            .post("/invoicesV2")
            .set("token", user2.body.token)
            .send({ invoice: XML.mockInvoice2 });

        await request(app)
            .delete(`/invoicesV2/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token);

        await request(app)
            .delete(`/invoicesV2/${invoice2.body.invoiceId}`)
            .set("token", user2.body.token);

        const trashList1 = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200);

        assert.strictEqual(trashList1.body.success, true);
        assert.strictEqual(trashList1.body.invoices[0].invoiceid, invoice1.body.invoiceId);
        assert.strictEqual(trashList1.body.invoices[0].amount, 123.45);

        const trashList2 = await request(app)
            .get("/trashV2")
            .set("token", user2.body.token)
            .expect(200);

        assert.strictEqual(trashList2.body.success, true);
        assert.strictEqual(trashList2.body.invoices[0].invoiceid, invoice2.body.invoiceId);
        assert.strictEqual(trashList2.body.invoices[0].amount, 543.21);

        const invoice3 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice3 });

        const invoice4 = await request(app)
            .post("/invoicesV2")
            .set("token", user2.body.token)
            .send({ invoice: XML.mockInvoice4 });

        await request(app)
            .delete(`/invoicesV2/${invoice3.body.invoiceId}`)
            .set("token", user1.body.token);

        await request(app)
            .delete(`/invoicesV2/${invoice4.body.invoiceId}`)
            .set("token", user2.body.token);

        const trashList3 = await request(app)
            .get("/trashV2")
            .set("token", user1.body.token)
            .expect(200);

        assert.strictEqual(trashList3.body.success, true);
        assert.strictEqual(trashList3.body.invoices[0].invoiceid, invoice1.body.invoiceId);
        assert.strictEqual(trashList3.body.invoices[0].amount, 123.45);
        assert.strictEqual(trashList3.body.invoices[1].invoiceid, invoice3.body.invoiceId);
        assert.strictEqual(trashList3.body.invoices[1].amount, 999.99);

        const trashList4 = await request(app)
            .get("/trashV2")
            .set("token", user2.body.token)
            .expect(200);

        assert.strictEqual(trashList4.body.success, true);
        assert.strictEqual(trashList4.body.invoices[0].invoiceid, invoice2.body.invoiceId);
        assert.strictEqual(trashList4.body.invoices[0].amount, 543.21);
        assert.strictEqual(trashList4.body.invoices[1].invoiceid, invoice4.body.invoiceId);
        assert.strictEqual(trashList4.body.invoices[1].amount, 67.89);
    });
});

server.close();