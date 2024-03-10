const request = require("supertest");
const app = require("../main/server"); 
const server = require("../main/server");



describe("User Registration", () => {
    it("should register a new user with valid username and password", async () => {
        const response = await request(app)
            .post("/register")
            .send({ username: "newuser", password: "ultrapassword" });
        expect(response.statusCode).toBe(302); // Expecting a redirect
        expect(response.header.location).toBe("/login"); // Expecting redirection to login page
    });

    it("should not register a user with missing username or password", async () => {
        const response = await request(app)
            .post("/register")
            .send({}); // Sending empty data
        expect(response.statusCode).toBe(400); // Expecting a bad request status code
    });

    it("should not register a user with existing username", async () => {
        const response = await request(app)
            .post("/register")
            .send({ username: "thestiiiig", password: "superpassword" }); // Existing username
        expect(response.statusCode).toBe(400); // Expecting a bad request status code
    });

    it("should register a user with valid username and password", async () => {
        const response = await request(app)
            .post("/register")
            .send({ username: "thestiiiig2", password: "testpassword#567" }); // Existing username
        expect(response.statusCode).toBe(302); 
    });

  
});

describe("User Login Page", () => {

    it("should login a registered user", async () => {
        const response = await request(app)
            .post("/login")
            .send({ username: "thestiiiig", password: "gigglemobile" });
        expect(response.statusCode).toBe(302); // Expecting a redirection to main
    });

    it("should NOT login an UNregistered user", async () => {
        const response = await request(app)
            .post("/login")
            .send({ username: "notREAL", password: "notreal" });
        expect(response.statusCode).toBe(401); // Expecting a login FAILURE
    });

    it("should NOT login a Valid Username BUT Invalid Password", async () => {
        const response = await request(app)
            .post("/login")
            .send({ username: "thestiiiig", password: "leCar" });
        expect(response.statusCode).toBe(401); // Expecting a login FAILURE
    });
});

describe("User full Registration and Login Process", () => {
    it("should register a new user with valid username and password", async () => {
        const response = await request(app)
            .post("/register")
            .send({ username: "newuser2", password: "ultrapassword" });
        expect(response.statusCode).toBe(302); // Expecting a redirect
        expect(response.header.location).toBe("/login"); // Expecting redirection to login page
    });

    it("should NOT login if mispelling in username", async () => {
        const response = await request(app)
            .post("/login")
            .send({ username: "newusr2", password: "ultrapassword" });
        expect(response.statusCode).toBe(401); // Expecting a login FAILURE
    });

    it("should NOT login if mispelling in password", async () => {
        const response = await request(app)
            .post("/login")
            .send({ username: "newuser2", password: "ultrapasword" });
        expect(response.statusCode).toBe(401); // Expecting a login FAILURE
    });
    
    it("should login a registered user", async () => {
        const response = await request(app)
            .post("/login")
            .send({ username: "newuser2", password: "ultrapassword" });
        expect(response.statusCode).toBe(302); // Expecting a redirection to main.html
    });

    // close server
    server.close();
});
