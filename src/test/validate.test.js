const request = require("supertest");
const validation = "https://sandc.vercel.app";
const samples = require("./samples.js");

describe("Testing Invoice Validation (External API)", function() {
    it("Testing External Invoice Validation API is online", async function() {
        await request(validation)
            .get("/")
            .expect(200);
    });

    it("Testing External Invoice Validation API with a Sample Invoice", async function() {
        const invoiceString = samples.getSampleInvoice();
        const response = await request(validation)
            .post("/validate")
            .set("Content-Type", "application/xml")
            .send(invoiceString)
            .expect(200);
        console.log(response.body);
    });

    it("Testing External Invoice Validation API with an Invalid Invoice", async function() {
        await request(validation)
            .post("/validate")
            .set("Content-Type", "application/xml")
            .send("Hello World")
            .expect(500);
    });
});
