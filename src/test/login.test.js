const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";
const invalidPassword1 = "toosmall2@";
const invalidUsername1 = "wowthisisasuperlongusername";

const request = require("supertest");
const app = require("../main/server");
const server = require("../main/server");
const assert = require("assert");

describe("Testing route POST /users/login", function() {
    beforeEach(async function() {
        // Clear data before running any tests
        await request(app)
            .delete("/clear2")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});
    });

    it("Valid Input: Login successfully", async function() {
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

        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");

    });

    it("Invalid Input: Login unsuccessful as password does not match username", async function() {
        await request(app)
            .post("/users2")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/users2")
            .send({ username: validUsername2, email: validEmail2, password: validPassword2 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/users/login2")
            .send({ username: validUsername1, password: validPassword2 })
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Password does not match username '${validUsername1}'`});

        await request(app)
            .post("/users/login2")
            .send({ username: validUsername2, password: validPassword1 })
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Password does not match username '${validUsername2}'`});
    });

    it("Invalid Input: Username doesn't exist", async function() {
        await request(app)
            .post("/users/login2")
            .send({ username: invalidUsername1, password: invalidPassword1 })
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Username '${invalidUsername1}' does not refer to an existing user`});

    });

});

// close server
server.close();
