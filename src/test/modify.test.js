const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";
const validUsername3 = "valid901Username1";
const validEmail3 = "123901test@gmail.com";
const validPassword3 = "less901Secure2@";

const emptyString = "";

const validAmount = 5;
const validDate = new Date(); 
validDate.setDate(validDate.getDate() - 2);
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 2);


const mockInvoice1 = { file: { amount: 125.45 } };
const mockInvoice2 = { "file": "{\"amount\": \"123.45\"}" };
const mockInvoice3 = { file: { amount: 17.90, date: validDate } };
const falseId = 0;


const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server"); 

describe("Modifying - Unit tests V1", function() {
    it("tests for Modifying Invoices", async function() {
        // setup user and login process
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

        // Using assert to check for each type
        assert.strictEqual(user1.body.success, true);
        assert.strictEqual(typeof user1.body.token, "string");

        // 1: create invoice
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
            .send({ invoice: mockInvoice3 })
            .expect(200);

        assert.strictEqual(invoice3.body.success, true);
        assert.strictEqual(typeof invoice3.body.invoiceId, "number");

        // check successful retrieve
        const returnedInvoice1 = await request(app)
            .get(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .expect(200)
            .expect("Content-Type", /application\/json/);
        assert.strictEqual(returnedInvoice1.body.success, true);
        assert.strictEqual(returnedInvoice1.body.invoice.invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(returnedInvoice1.body.invoice.amount, mockInvoice1.file.amount);
        assert.strictEqual(returnedInvoice1.body.invoice.trashed, false);

        // modify testing here
        // what is being tested:
        /**
         * error 400 invalid invoice - added
         * error 401 wrong token - added
         * error 403 unauthorised - added
         * error 400 empty entries - added
         * error 400 future newDate string - added
         * error 400 amount NOT positive - added
         * sucess 200 amount positive, newDate valid - added
         * success 200, no modification to amount, newDate valid - added
         * success 200 empty newDate string - added
         */

        // error 400 invoiceId not found
        await request(app)
            .put(`/invoices/${falseId}`)
            .set("token", user1.body.token)
            .send({ newAmount: validAmount, newDate: validDate })
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `invoiceId '${falseId}' does not refer to an existing invoice`});

        // error 401 bad token
        await request(app)
            .put(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", falseId)
            .send({ newAmount: validAmount, newDate: validDate })
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});

        // error 403 unauthorised
        await request(app)
            .put(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user2.body.token)
            .send({ newAmount: validAmount, newDate: validDate })
            .expect(403)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": `Not owner of this invoice '${invoice1.body.invoiceId}'`});
        
        // error 400 empty entries
        await request(app)
            .put(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .send({ newAmount: emptyString, newDate: emptyString })
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Invalid date or amount provided; could not modify"});
        
        // error 400 date in future
        await request(app)
            .put(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .send({ newAmount: validAmount, newDate: futureDate })
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Invalid date or amount provided; could not modify"});
    
        // error 400 amount not positive
        await request(app)
            .put(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .send({ newAmount: "0", newDate: validDate })
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Invalid date or amount provided; could not modify"});
        
        // success 200, params OK
        const modifiedInvoice1 = await request(app)
            .put(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token)
            .send({ newAmount: validAmount, newDate: validDate })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(modifiedInvoice1.body.success, true);
        assert.strictEqual(modifiedInvoice1.body.invoice.invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(modifiedInvoice1.body.invoice.amount, validAmount);
        assert.strictEqual(modifiedInvoice1.body.invoice.date, validDate.toJSON());
        assert.strictEqual(modifiedInvoice1.body.invoice.trashed, false);

        // success 200, amount NOT changed but date changed
        const modifiedInvoice2 = await request(app)
            .put(`/invoices/${invoice2.body.invoiceId}`)
            .set("token", user2.body.token)
            .send({ newAmount: " ", newDate: validDate })
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(modifiedInvoice2.body.success, true);
        assert.strictEqual(modifiedInvoice2.body.invoice.invoiceId, invoice2.body.invoiceId);
        assert.strictEqual(modifiedInvoice2.body.invoice.amount, invoice2.body.amount);
        assert.strictEqual(modifiedInvoice2.body.invoice.date, validDate.toJSON());
        assert.strictEqual(modifiedInvoice2.body.invoice.trashed, false);

        // success 200, amount changed but date NOT changed
        const modifiedInvoice3 = await request(app)
            .put(`/invoices/${invoice3.body.invoiceId}`)
            .set("token", user3.body.token)
            .send({ newAmount: validAmount, newDate: null})
            .expect(200)
            .expect("Content-Type", /application\/json/);

        assert.strictEqual(modifiedInvoice3.body.success, true);
        assert.strictEqual(modifiedInvoice3.body.invoice.invoiceId, invoice3.body.invoiceId);
        assert.strictEqual(modifiedInvoice3.body.invoice.amount, validAmount);
        assert.strictEqual(modifiedInvoice3.body.invoice.date, invoice3.body.date);
        assert.strictEqual(modifiedInvoice3.body.invoice.trashed, false);
    });
});

server.close();