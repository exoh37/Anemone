const request = require("supertest");
const app = require("../main/server");
const server = require("../main/server"); 

// Sample test using supertest and mocha
describe("Testing route: /clear", function() {
    it("Valid return status and return body", function(done) {
        request(app)
            // Route
            .delete("/clear")
            // Status Code
            .expect(200)
            // Regex for checking content type to ignore charset
            .expect("Content-Type", /application\/json/)
            // Expected JSON body
            .expect({"success": true})
            // Call done
            .end(done);
    });
});

server.close();