/*
 * Const app = require("./server/index"); 
 * const invoiceUpload = require("./server/invoiceUpload");
 */

/*
 * Describe("POST /invoices", function() {
 *     it("should return status 200 and success message on successful upload", async function() {
 *         const res = await request(app)
 *             .post("/invoices")
 *             .send({ file: "{\"amount\": \"500\"}" });
 */

/*
 *         Expect(res.status).toBe(200);
 *         expect(res.body).toEqual({"invoice": {"amount": expect.any(String), "date": expect.any(Number), "invoiceId": expect.any(Number), "invoiceName": "Name", "trashed": false}, "success": true});
 *         invoiceUpload.clear();
 *     });
 */

/*
 *     It("should return status 400 and error message on failed upload", async function() {
 *         const res = await request(app)
 *             .post("/invoices")
 *             .send();
 */

/*
 *         Expect(res.status).toBe(400);
 *         expect(res.body).toEqual({"message": "Error uploading file: Unexpected token u in JSON at position 0", "success": false});
 *         invoiceUpload.clear();
 *     });
 *     app.close();
 * });
 */


const validUsername1 = "validUsername1",
    validEmail1 = "test123@gmail.com",
    validPassword1 = "ThisIsSecure!123",

    mockInvoice1 = { file: { amount: 125.45 } };

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server"), 

    invalid_token = 0;

describe("Retrieve system tests V2", function() {
    it("tests for Retrieving Invoices", async function() {
        // Setup user and login process
        await request(app)
            .delete("/clear")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/users")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});
        

        const user1 = await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        // Using assert to check for each type
        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");

        //Invalid token
        await request(app)
            .post("/invoices")
            .set("token", invalid_token)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});        
        

        // Successful upload
        const invoice1 = await request(app)
            .post("/invoices")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice1 })
            .expect(200);

        assert.strictEqual(invoice1.body.success, true);
        assert.strictEqual(typeof invoice1.body.invoiceId, "number");




    });
});

server.close();