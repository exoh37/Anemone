const request = require("supertest");
const app = require("../main/server"); 
const server = require("../main/server");


describe("Retrieve Invoices", () => {
    it("should not retrieve anything when given an invalid invoiceId", async () => {
        const response = await request(app)
            .get("/retrieve/0") // Send a GET request to the correct route with the invoiceId
            .send();
        expect(response.statusCode).toBe(404); // Expect an error 404
    });

    it("should retrieve the correct invoice when given a valid invoiceId '1234'", async () => {
        const response = await request(app)
            .get("/retrieve/1234") // Send a GET request to the correct route with the invoiceId
            .send();
        expect(response.statusCode).toBe(200); // Expect OK
    });

    it("should retrieve the correct invoice when given a valid invoiceId '1209343249048'", async () => {
        const response = await request(app)
            .get("/retrieve/1209343249048") // Send a GET request to the correct route with the invoiceId
            .send();
        expect(response.statusCode).toBe(200); // Expect OK
    });


    server.close();
});