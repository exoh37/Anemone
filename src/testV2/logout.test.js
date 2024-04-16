const validUsername1 = "validUsername1";
const validEmail1 = "test123@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const falseId = 0;

const request = require("supertest");
const app = require("../main/server");
const server = require("../main/server");
const assert = require("assert");

describe("Testing route POST /usersV2/login", function() {
    beforeEach(async function() {
        // Clear data before running any tests
        await request(app)
            .delete("/clearV2")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});
    });

    it("Valid Input: Logout successfully", async function() {
        await request(app)
            .post("/usersV2")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        let user = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(user.body.success, true);
        assert.strictEqual(typeof user.body.token, "string");

        await request(app)
            .post("/usersV2/logout")
            .set("token", user.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .get("/invoicesV2")
            .set("token", user.body.token)
            .expect(401);

    });

    it("Invalid Input: Logging out user that has been logged out", async function() {
        await request(app)
            .post("/usersV2")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        let user = await request(app)
            .post("/usersV2/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(user.body.success, true);
        assert.strictEqual(typeof user.body.token, "string");

        await request(app)
            .post("/usersV2/logout")
            .set("token", user.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/usersV2/logout")
            .set("token", user.body.token)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});
    });

    it("Invalid Input: Invalid token", async function() {
        await request(app)
            .post("/usersV2/logout")
            .set("token", falseId)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});
    });

    it("Invalid Input: Empty token", async function() {
        await request(app)
            .post("/usersV2/logout")
            .set("token", "")
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});
    });
});

// close server
server.close();
