// const request = require("supertest");
// const app = require("../main/server"); 
// const server = require("../main/server");
// const fs = require("fs");

// const invoices = JSON.parse(fs.readFileSync("src/main/server/TEMP_invoiceStorage.json")); 


// describe("Retrieve Invoices", () => {
//     invoices.push({
//         "invoiceId": "1234",
//         "amount": "500"
//     },
//     {
//         "invoiceId": "3120987",
//         "amount": "123"
//     },
//     {
//         "invoiceId": "1",
//         "amount": "13289"
//     },
//     {
//         "invoiceId": "1209343249048",
//         "amount": "0001"
//     });

//     it("should not retrieve anything when given an invalid invoiceId", async () => {
        
//         const response = await request(app)
//             .get("/invoices/0") // Send a GET request to the correct route with the invoiceId
//             .send();
//         expect(response.statusCode).toBe(404); // Expect an error 404
//     });

//     it("should retrieve the correct invoice when given a valid invoiceId '1234'", async () => {
//         const response = await request(app)
//             .get("/invoices/1234") // Send a GET request to the correct route with the invoiceId
//             .send();
//         expect(response.statusCode).toBe(404); // Expect OK
//     });

//     it("should retrieve the correct invoice when given a valid invoiceId '1209343249048'", async () => {
//         const response = await request(app)
//             .get("/invoices/1209343249048") // Send a GET request to the correct route with the invoiceId
//             .send();
//         expect(response.statusCode).toBe(404); // Expect OK
//     });


//     server.close();
// });