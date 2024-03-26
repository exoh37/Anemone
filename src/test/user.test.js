// const request = require("supertest");
// const app = require("../main/server"); 
// const server = require("../main/server");



// describe("User Registration", () => {
//     // FIRST TEST IS AI-GENERATED
//     it("should register a new user with valid username and password", async () => {
//         const response = await request(app)
//             .post("/users")
//             .send({ username: "newuser", password: "Password#123" });
//         expect(response.statusCode).toBe(302); // Expecting a redirect
//     });

//     it("should not register a user with missing username or password", async () => {
//         const response = await request(app)
//             .post("/users")
//             .send({}); // Sending empty data
//         expect(response.statusCode).toBe(400); // Expecting a bad request status code
//     });

//     it("should not register a user with too short username", async () => {
//         const response = await request(app)
//             .post("/users")
//             .send({ username: "nn", password: "Password#123" });
//         expect(response.statusCode).toBe(400); // Expecting a bad request status code
//     });

//     it("should not register a user with spaced username", async () => {
//         const response = await request(app)
//             .post("/users")
//             .send({ username: "n - -n", password: "Password#123" });
//         expect(response.statusCode).toBe(400); // Expecting a bad request status code
//     });

//     it("should not register a user with too long username", async () => {
//         const response = await request(app)
//             .post("/users")
//             .send({ username: "ohhhhhhhhhhhhhhhhhhhhhhhhhhhh", password: "Password#123" });
//         expect(response.statusCode).toBe(400); // Expecting a bad request status code
//     });

//     it("should not register a user with invalid password", async () => {
//         const response = await request(app)
//             .post("/users")
//             .send({ username: "user1", password: "pass1" });
//         expect(response.statusCode).toBe(400); // Expecting a bad request status code
//     });

//     it("should not register a user with invalid password 2", async () => {
//         const response = await request(app)
//             .post("/users")
//             .send({ username: "user1", password: "Password123" });
//         expect(response.statusCode).toBe(400); // Expecting a bad request status code
//     });

//     it("should not register a user with existing username", async () => {
//         const response = await request(app)
//             .post("/users")
//             .send({ username: "thestiiiig", password: "Password#123" }); // Existing username
//         expect(response.statusCode).toBe(400); // Expecting a bad request status code
//     });

//     it("should register a user with valid username and password", async () => {
//         const response = await request(app)
//             .post("/users")
//             .send({ username: "thestiiiig2", password: "testPassword#567" }); // Existing username
//         expect(response.statusCode).toBe(302); 
//     });
// });

// describe("User Login Page", () => {

//     it("should login a registered user", async () => {
//         const response = await request(app)
//             .post("/login")
//             .send({ username: "thestiiiig", password: "gigglemobile" });
//         expect(response.statusCode).toBe(302); // Expecting a redirection to main
//     });

//     it("should NOT login an UNregistered user", async () => {
//         const response = await request(app)
//             .post("/login")
//             .send({ username: "notREAL", password: "notreal" });
//         expect(response.statusCode).toBe(401); // Expecting a login FAILURE
//     });

//     it("should NOT login a Valid Username BUT Invalid Password", async () => {
//         const response = await request(app)
//             .post("/login")
//             .send({ username: "thestiiiig", password: "leCar" });
//         expect(response.statusCode).toBe(401); // Expecting a login FAILURE
//     });
// });

// describe("User full Registration and Login Process", () => {
//     it("should register a new user with valid username and password", async () => {
//         const response = await request(app)
//             .post("/users")
//             .send({ username: "newuser2", password: "Password#123" });
//         expect(response.statusCode).toBe(302); // Expecting a redirect
//     });

//     it("should NOT login if mispelling in username", async () => {
//         const response = await request(app)
//             .post("/login")
//             .send({ username: "newusr2", password: "Password#123" });
//         expect(response.statusCode).toBe(401); // Expecting a login FAILURE
//     });

//     it("should NOT login if mispelling in password", async () => {
//         const response = await request(app)
//             .post("/login")
//             .send({ username: "newuser2", password: "ultrapasword" });
//         expect(response.statusCode).toBe(401); // Expecting a login FAILURE
//     });
    
//     it("should login a registered user", async () => {
//         const response = await request(app)
//             .post("/login")
//             .send({ username: "newuser2", password: "Password#123" });
//         expect(response.statusCode).toBe(302); // Expecting a redirection to main.html
//     });

//     // close server
//     server.close();
// });
