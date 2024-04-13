const XML = require("./sampleXML");
const request = require("supertest");

const recipient = "noreply.anemone.seng2021@gmail.com";

describe("Testing route POST /invoices/:invoiceId/send", function() {
    // 20 second timeout to account for connecting to other team's API
    this.timeout(20000);

    it("tests for Retrieving Invoices", async function() {
        await request("https://invoice-seng2021-24t1-eggs.vercel.app")
            .post("/send/email")
            .set("Content-Type", "application/json")
            .send({ 
                from: "Anemone Testing",
                recipient: recipient,
                xmlString: XML.mockInvoice1
            })
            .expect(200);
    });
});

