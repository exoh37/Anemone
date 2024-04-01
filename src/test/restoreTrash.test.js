const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validUsername3 = "thisIsAValidName123";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validEmail3 = "t1e2s3t@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";
const validPassword3 = "ThisIsSecure!4215";


const mockInvoice1 = { file: { amount: 125.45 } };
const mockInvoice2 = { file: { amount: 123.45 } };
const falseId = 0;


const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server"); 


//tests
//1. successfully in trash
//2. invalid token, not in trash
//3. invalid invoiceid, not in trash
//4. invoiceid already in trash, not trashed
//5. valid token but invalid invoiceid (user is not owner of the invoice), not trashed

describe("Restore from trash unit tests", function() {
    beforeEach(async function() {
        // Clear data before running any tests
        await request(app)
            .delete("/clear")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});
    });

    it("Test for restoring from trash successfully", async function() {
        // user registered
        await request(app)
            .post("/users")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});
        
            
        await request(app)
            .post("/users")
            .send({ username: validUsername2, email: validEmail2, password: validPassword2 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        await request(app)
            .post("/users")
            .send({ username: validUsername3, email: validEmail3, password: validPassword3 })
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

        // user logged in
        const user1 = await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword1 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        
        const user2 = await request(app)
            .post("/users/login")
            .send({ username: validUsername2, password: validPassword2 })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const user3 = await request(app)
            .post("/users/login")
            .send({ username: validUsername3, password: validPassword3 })
            .expect(200)
            .expect("Content-Type", /application\/json/);
        
        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");
    
        // invoice created
        const invoice1 = await request(app)
            .post("/invoices")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice1 })
            .expect(200);

        
        assert.strictEqual(invoice1.body.success, true);
        assert.strictEqual(typeof invoice1.body.invoiceId, "number");
    
        const invoice2 = await request(app)
            .post("/invoices")
            .set("token", user2.body.token)
            .send({ invoice: mockInvoice2 })
            .expect(200);

    
        assert.strictEqual(invoice2.body.success, true);
        assert.strictEqual(typeof invoice2.body.invoiceId, "number");

        const invoice3 = await request(app)
            .post("/invoices")
            .set("token", user3.body.token)
            .send({ invoice: mockInvoice2 })
            .expect(200);

        
        // Move to trash
        await request(app)
            .delete(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);
        
        await request(app)
            .delete(`/invoices/${invoice3.body.invoiceId}`)
            .set("token", user3.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        
        const restoreResponse = await request(app)
            .post(`/invoices/trash/${invoice1.body.invoiceId}/restore`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(restoreResponse.body.success, true);


    });

    it("failed test invalid token", async function() {
        await request(app)
            .post("/users")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 });

        const user1 = await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword1 });

        const invoice1 = await request(app)
            .post("/invoices")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice1 });

        await request(app)
            .delete(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token);

        // Invalid token
        await request(app)
            .post(`/invoices/trash/${invoice1.body.invoiceId}/restore`)
            .set("token", falseId)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // Empty token
        await request(app)
            .post(`/invoices/trash/${invoice1.body.invoiceId}/restore`)
            .set("token", "")
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});
    });


});

server.close();
