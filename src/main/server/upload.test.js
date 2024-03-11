const request = require("supertest");
const app = require("./index"); 

const invoiceUpload = require("./invoiceUpload");

describe("POST /upload", () => {
    it("should return status 200 and success message on successful upload", async () => {
        const res = await request(app)
            .post("/upload")
            .send({ file: "{\"amount\": \"500\"}" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.any(Number));
        invoiceUpload.clear();
    });

    it("should return status 400 and error message on failed upload", async () => {
        const res = await request(app)
            .post("/upload")
            .send();

        expect(res.status).toBe(400);
        expect(res.body).toEqual({"message": "Error uploading file: Unexpected token u in JSON at position 0", "success": false});
        invoiceUpload.clear();
    });
 
});
