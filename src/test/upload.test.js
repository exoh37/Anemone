
const validUsername1 = "validUsername1";
const validEmail1 = "test123@gmail.com";
const validPassword1 = "ThisIsSecure!123";

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

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server");

const invalid_token = 0;

describe("Testing route POST /invoices", function() {
    it("tests for Uploading Invoices", async function() {
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

        const user1 = await request(app)
            .post("/users/login2")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Using assert to check for each type
        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");

        //Invalid token
        await request(app)
            .post("/invoices2")
            .set("token", invalid_token)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // Successful upload
        const invoice1 = await request(app)
            .post("/invoices2")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice1 })
            .expect(200);

        assert.strictEqual(invoice1.body.success, true);
        assert.strictEqual(typeof invoice1.body.invoiceId, "number");

    });
});

server.close();