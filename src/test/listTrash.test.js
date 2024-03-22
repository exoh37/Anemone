const validUsername1 = "validUsername1";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2@";
const mockInvoice1 = { file: { amount: 123.45 } };
const mockInvoice2 = { file: { amount: 42.42 } };
const mockInvoice3 = { file: { amount: 999.99 } };
const mockInvoice4 = { file: { amount: 67.89 } };
const invalidToken = "thisIsAnInvalidToken";

const request = require("supertest");
const assert = require("assert");
const app = require("../main/server");
const server = require("../main/server"); 

describe("List from trash test(s)", function() {
    it("Invalid token", async function() {
        await request(app)
            .delete("/clear");

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

        await request(app)
            .get("/trash")
            .set("token", invalidToken)
            .expect(401)
            .expect("Content-Type", /application\/json/)
            .expect({"success": false, "error": "Token is empty or invalid"});
    });

    it("Valid usage with 1 invoice in trash", async function() {
        await request(app)
            .delete("/clear");

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

        const trashList = await request(app)
            .get("/trash")
            .set("token", user1.body.token)
            .expect(200);
        
        assert.strictEqual(trashList.body.success, true);
        assert.strictEqual(trashList.body.invoices[0].invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(trashList.body.invoices[0].amount, invoice1.body.amount);
        assert.strictEqual(trashList.body.invoices[0].trashed, true);
    });

    it("Valid usage with 2 invoices in trash (order check)", async function() {
        await request(app)
            .delete("/clear");

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

        const invoice2 = await request(app)
            .post("/invoices")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice2 });

        await request(app)
            .delete(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token);

        await request(app)
            .delete(`/invoices/${invoice2.body.invoiceId}`)
            .set("token", user1.body.token);

        const trashList = await request(app)
            .get("/trash")
            .set("token", user1.body.token)
            .expect(200);
        
        assert.strictEqual(trashList.body.success, true);
        assert.strictEqual(trashList.body.invoices[0].invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(trashList.body.invoices[0].amount, invoice1.body.amount);
        assert.strictEqual(trashList.body.invoices[0].trashed, true);
        assert.strictEqual(trashList.body.invoices[1].invoiceId, invoice2.body.invoiceId);
        assert.strictEqual(trashList.body.invoices[1].amount, invoice2.body.amount);
        assert.strictEqual(trashList.body.invoices[1].trashed, true);
    });

    it("Valid usage with invoices deleted for 2 different users", async function() {
        await request(app)
            .delete("/clear");

        await request(app)
            .post("/users")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 });

        await request(app)
            .post("/users")
            .send({ username: validUsername2, email: validEmail2, password: validPassword2 });

        const user1 = await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword1 });

        const user2 = await request(app)
            .post("/users/login")
            .send({ username: validUsername2, password: validPassword2 });

        const invoice1 = await request(app)
            .post("/invoices")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice1 });

        const invoice2 = await request(app)
            .post("/invoices")
            .set("token", user2.body.token)
            .send({ invoice: mockInvoice2 });

        await request(app)
            .delete(`/invoices/${invoice1.body.invoiceId}`)
            .set("token", user1.body.token);

        await request(app)
            .delete(`/invoices/${invoice2.body.invoiceId}`)
            .set("token", user2.body.token);

        const trashList1 = await request(app)
            .get("/trash")
            .set("token", user1.body.token)
            .expect(200);
        
        assert.strictEqual(trashList1.body.success, true);
        assert.strictEqual(trashList1.body.invoices[0].invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(trashList1.body.invoices[0].amount, invoice1.body.amount);
        assert.strictEqual(trashList1.body.invoices[0].trashed, true);

        const trashList2 = await request(app)
            .get("/trash")
            .set("token", user2.body.token)
            .expect(200);

        assert.strictEqual(trashList2.body.success, true);
        assert.strictEqual(trashList2.body.invoices[0].invoiceId, invoice2.body.invoiceId);
        assert.strictEqual(trashList2.body.invoices[0].amount, invoice2.body.amount);
        assert.strictEqual(trashList2.body.invoices[0].trashed, true);

        const invoice3 = await request(app)
            .post("/invoices")
            .set("token", user1.body.token)
            .send({ invoice: mockInvoice3 });

        const invoice4 = await request(app)
            .post("/invoices")
            .set("token", user2.body.token)
            .send({ invoice: mockInvoice4 });

        await request(app)
            .delete(`/invoices/${invoice3.body.invoiceId}`)
            .set("token", user1.body.token);

        await request(app)
            .delete(`/invoices/${invoice4.body.invoiceId}`)
            .set("token", user2.body.token);

        const trashList3 = await request(app)
            .get("/trash")
            .set("token", user1.body.token)
            .expect(200);
        
        assert.strictEqual(trashList3.body.success, true);
        assert.strictEqual(trashList3.body.invoices[0].invoiceId, invoice1.body.invoiceId);
        assert.strictEqual(trashList3.body.invoices[0].amount, invoice1.body.amount);
        assert.strictEqual(trashList3.body.invoices[0].trashed, true);
        assert.strictEqual(trashList3.body.invoices[1].invoiceId, invoice3.body.invoiceId);
        assert.strictEqual(trashList3.body.invoices[1].amount, invoice3.body.amount);
        assert.strictEqual(trashList3.body.invoices[1].trashed, true);

        const trashList4 = await request(app)
            .get("/trash")
            .set("token", user2.body.token)
            .expect(200);

        assert.strictEqual(trashList4.body.success, true);
        assert.strictEqual(trashList4.body.invoices[0].invoiceId, invoice2.body.invoiceId);
        assert.strictEqual(trashList4.body.invoices[0].amount, invoice2.body.amount);
        assert.strictEqual(trashList4.body.invoices[0].trashed, true);
        assert.strictEqual(trashList4.body.invoices[1].invoiceId, invoice4.body.invoiceId);
        assert.strictEqual(trashList4.body.invoices[1].amount, invoice4.body.amount);
        assert.strictEqual(trashList4.body.invoices[1].trashed, true);
    });
});