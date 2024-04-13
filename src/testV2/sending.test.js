const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";

const falseId = 0;
const falseEmailAddress = "thisIs@noMansLand";

const recipient = "noreply.anemone.seng2021@gmail.com";

const XML = require("./sampleXML");

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server");

describe("Testing route POST /invoices/:invoiceId/send", function() {
    it("tests for Retrieving Invoices", async function() {
        // Setup user and login process
        await request(app)
            .delete("/clearV2")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

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

        const user1 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const user2 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername2, password: validPassword2 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Using assert to check for each type
        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");

        // 1: create invoice
        const invoice1 = await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: XML.mockInvoice1 })
            .expect(200);

        assert.strictEqual(invoice1.body.success, true);
        assert.strictEqual(typeof invoice1.body.invoiceId, "number");

        // Unsuccessful send as no such token
        await request(app)
            .post(`/invoicesV2/${invoice1.body.invoiceId}/send`)
            .set("token", falseId)
            .send({ recipient: recipient })
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // Unsuccessful send as recipient is not an email address
        await request(app)
            .post(`/invoicesV2/${invoice1.body.invoiceId}/send`)
            .set("token", user1.body.token)
            .send({ recipient: falseEmailAddress })
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // Unsuccessful send as no such id
        await request(app)
            .post(`/invoicesV2/${falseId}/send`)
            .set("token", user1.body.token)
            .send({ recipient: falseId })
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `invoiceId '${falseId}' does not refer to an existing invoice`});

        // Unsuccessful send as wrong user
        await request(app)
            .post(`/invoicesV2/${invoice1.body.invoiceId}/send`)
            .set("token", user2.body.token)
            .send({ recipient: recipient })
            .expect(403)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Not owner of this invoice '${invoice1.body.invoiceId}'`});

        // Success
        await request(app)
            .post(`/invoicesV2/${invoice1.body.invoiceId}/send`)
            .set("token", user1.body.token)
            .send({ recipient: recipient })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});
    });
});

server.close();