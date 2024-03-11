const validUsername1 = "validUsername1!";
const validUsername2 = "thisIsAValidName";
const validEmail1 = "test123@gmail.com";
const validEmail2 = "123test@gmail.com";
const validPassword1 = "ThisIsSecure!123";
const validPassword2 = "lessSecure2?";
const invalidUsername = "name with space";
const mockInvoice1 = "invoice1.xml";
const mockInvoice2 = "invoice2.xml";
const invalidToken = "thisIsAnInvalidToken";

const request = require("supertest");
const app = require("../main/server"); 

describe("Sprint 1 system tests", () => {
    // System Test Flowchart
    // Register (invalid)
    // Register User 1 (valid)
    // Register User 2 (valid)
    // Login User 1 with User 2's password (invalid)
    // Login User 2 with User 1's password (invalid)
    // Login User 1 (valid)
    // Login User 2 (valid)
    // User 1 Upload Invoice (valid)
    // User 2 Upload Invoice (valid)
    // User 1 Retrieve Invoice (invalid)
    // User 2 Retrieve Invoice (invalid)
    // User 1 Retrieve Invoice (valid)
    // User 2 Retrieve Invoice (valid)
    // Fake token Retrieve Invoice (invalid)

    it("Invalid registration", async () => {
        // Register fail
        let response = await request(app)
            .post("/users")
            .send({ username: invalidUsername, email: validEmail1, password: validPassword1 });
        expect(response.statusCode).toBe(400);
        expect(response).toStrictEqual({
            succcess: false,
            error: expect.any(String)
        });
        
        // Successful registering
        response = await request(app)
            .post("/users")
            .send({ username: validUsername1, email: validEmail1, password: validPassword1 });
        expect(response.statusCode).toBe(200);
        expect(response).toStrictEqual({
            succcess: true,
            userId: expect.any(Number)
        });

        response = await request(app)
            .post("/users")
            .send({ username: validUsername2, email: validEmail2, password: validPassword2 });
        expect(response.statusCode).toBe(200);
        expect(response).toStrictEqual({
            succcess: true,
            userId: expect.any(Number)
        });

        // Login fails
        response = await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword2 });
        expect(response.statusCode).toBe(401);
        expect(response).toStrictEqual({
            succcess: false,
            error: expect.any(String)
        });

        response = await request(app)
            .post("/users/login")
            .send({ username: validUsername2, password: validPassword1 });
        expect(response.statusCode).toBe(401);
        expect(response).toStrictEqual({
            succcess: false,
            error: expect.any(String)
        });

        // Get tokens
        const token1 = await request(app)
            .post("/users/login")
            .send({ username: validUsername1, password: validPassword1 });
        expect(token1.statusCode).toBe(200);
        expect(token1).toStrictEqual({
            succcess: true,
            token: expect.any(String)
        });

        const token2 = await request(app)
            .post("/users/login")
            .send({ username: validUsername2, password: validPassword2 });
        expect(token2.statusCode).toBe(200);
        expect(token2).toStrictEqual({
            succcess: true,
            token: expect.any(String)
        });

        // Upload invoices
        const invoiceId1 = await request(app)
            .post("/invoices")
            .set("header", token1.token)
            .send({ invoice: mockInvoice1 });
        expect(invoiceId1.statusCode).toBe(200);
        expect(invoiceId1).toStrictEqual({
            success: true,
            invoice: {
                invoiceId: expect.any(Number),
                invoiceName: expect.any(String),
                amount: expect.any(Number),
                date: expect.any(String),
                trashed: false
            }
        });

        const invoiceId2 = await request(app)
            .post("/invoices")
            .set("header", token2.token)
            .send({ invoice: mockInvoice2 });
        expect(invoiceId2.statusCode).toBe(200);
        expect(invoiceId2).toStrictEqual({
            success: true,
            invoice: {
                invoiceId: expect.any(Number),
                invoiceName: expect.any(String),
                amount: expect.any(Number),
                date: expect.any(String),
                trashed: false
            }
        });

        // 403: Valid token + invoice but doesn't own
        response = await request(app)
            .get("/invoices/" + invoiceId1.invoice.invoiceId)
            .set("header", token2.token);
        expect(response.statusCode).toBe(403);
        expect(response).toStrictEqual({
            success: false,
            error: expect.any(String)
        });

        response = await request(app)
            .get("/invoices/" + invoiceId2.invoice.invoiceId)
            .set("header", token1.token);
        expect(response.statusCode).toBe(403);
        expect(response).toStrictEqual({
            success: false,
            error: expect.any(String)
        });

        // Valid retrievals
        response = await request(app)
            .get("/invoices/" + invoiceId1.invoice.invoiceId)
            .set("header", token1.token);
        expect(response.statusCode).toBe(200);
        expect(response).toStrictEqual({
            invoiceId: invoiceId1.invoice.invoiceId,
            invoiceName: expect.any(String),
            amount: expect.any(Number),
            date: expect.any(String),
            trashed: false
        });

        response = await request(app)
            .get("/invoices/" + invoiceId2.invoice.invoiceId)
            .set("header", token2.token);
        expect(response.statusCode).toBe(200);
        expect(response).toStrictEqual({
            invoiceId: invoiceId2.invoice.invoiceId,
            invoiceName: expect.any(String),
            amount: expect.any(Number),
            date: expect.any(String),
            trashed: false
        });

        // Fake token retrieval
        response = await request(app)
            .get("/invoices/" + invoiceId1.invoice.invoiceId)
            .set("header", invalidToken);
        expect(response.statusCode).toBe(401);
        expect(response).toStrictEqual({
            success: false,
            error: expect.any(String)
        });
    });
});
