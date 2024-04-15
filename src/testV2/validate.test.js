
const validUsername1 = "validUsername1";
const validEmail1 = "test123@gmail.com";
const validPassword1 = "ThisIsSecure!123";

const invalidXMLfile1 = "this is just a string";
const invalidXMLfile2 = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\ninvalid syntax haha";

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server");

describe("Testing invoice validation is working", function() {
    it("Validation", async function() {
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

        const user1 = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Using assert to check for each type
        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");

        // Unsuccessful upload due to invalid invoice format (1)
        await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: invalidXMLfile1 })
            .expect(400)
            .expect({"success": false, "error": "Invoice is of invalid format"});

        // Unsuccessful upload due to invalid invoice format (2)
        await request(app)
            .post("/invoicesV2")
            .set("token", user1.body.token)
            .send({ invoice: invalidXMLfile2 })
            .expect(400)
            .expect({"success": false, "error": "Invoice is of invalid format"});
    });
});

server.close();