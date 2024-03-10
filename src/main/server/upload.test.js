const request = require("supertest");
const app = require("./index"); 

describe("POST /upload", () => {
    it("should return status 200 and success message on successful upload", async () => {
        jest.mock("./invoiceUpload", () => jest.fn(() => ({ success: true, message: "File uploaded successfully" })));

        const res = await request(app)
            .post("/upload")
            .send({ file: "{\"invoiceId\": \"1234\", \"amount\": \"500\"}" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true, message: "File uploaded successfully" });
    });
});
