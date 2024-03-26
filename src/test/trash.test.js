const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";


const mockInvoice1 = { file: { amount: 125.45 } };
const mockInvoice2 = { "file": "{\"amount\": \"123.45\"}" };
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
        
        // user logged in
        const user1 = await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword1 })
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

        // retrieve invoice
        const returnedInvoice1 = await request(app)
            .get(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);
    
        assert.strictEqual(returnedInvoice1.body.success, true);
        assert.strictEqual(returnedInvoice1.body.invoice.invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(returnedInvoice1.body.invoice.amount, mockInvoice1.file.amount);
        assert.strictEqual(returnedInvoice1.body.invoice.trashed, false);

        // move invoice to trash
        const moveToTrashResult = await request(app)
            .delete(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200);

        assert.strictEqual(moveToTrashResult.body.success = true);

        const trashedInvoices = await request(app)
            .get(`/trash/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)


        assert.strictEqual(trashedInvoices.body.success, true);
        assert.strictEqual(trashedInvoices.body.invoice.invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(trashedInvoices.body.invoice.amount, mockInvoice1.file.amount);
        assert.strictEqual(trashedInvoices.body.invoice.trashed, true);

    });
});

server.close();