const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";


const mockInvoice1 = { file: { amount: 125.45 } };
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

describe("moveToTrash system tests", function() {
    it("test for moving invoice to trash successfully", async function() {
        
        await request(app)
            .delete("/clear")
            .expect(200)
            .expect("Content-Type", /application\/json/)
            .expect({"success": true});

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

        // unsuccessful move to trash as user is incorrect
        await request(app)
            .put(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user2.body.token)
            .expect(403)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Not owner of this invoice '${invoice1.body.invoiceId}'`});

        // unsucessful move to trash as invoiceId is incorrect
        await request(app)
            .get(`/invoices/${falseId}`)
            .set("token", user1.body.token)
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `invoiceId '${falseId}' does not refer to an existing invoice`});

        // unsuccessful retrieve as no such Token
        await request(app)
            .get(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", falseId)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // actually move invoice to trash
        const moveToTrashResult = await request(app)
            .put(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(moveToTrashResult.body.success, true);
        // move invoice to trash successfully
        await request(app)
            .get(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `invoiceId '${invoice1.body.invoiceId}' does not refer to an existing invoice`});

        // invoice wont be found since it has been moved (via put req) to trash file
       

    });
});

server.close();
