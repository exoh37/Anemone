// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path"); 


// Create an Express application
const app = express();

const fs = require("fs");
// Read the users file
const users = JSON.parse(fs.readFileSync("src/main/server/TEMP_userStorage.json"));

// Middleware to parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../../../Front_end")));

// Define a route for the root URL ('/')
app.get("/", (req, res) => {
    res.send(`
    <p> Welcome! Click here to get started  <a href="/Register">Register</a>.</p>
  `);
});

// Define a route for the registration form
app.get("/register", (req, res) => {
    const filePath = path.join(__dirname, "../../../Front_end/Register.html");
    res.sendFile(filePath);
});


// Handle registration form submission
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send("Username and password are required");
        return;
    }

    // Check if username already exists
    for (const user of users) {
        if (user.username == username) {
            res.status(400).send("Username already exists");
            return;
        }
    }
    /*
  // check if password is valid conditions (SECURITY PURPOSES)
  if (!validPassword(password)) {
    res.status(400).send('Password must be: greater than 8 characters, include special characters');
  }
  */
    // Add new user to the list of users
    console.log("The username and password are being added");
    users.push({ username, password });

    // Redirect to page 2 (login page)
    res.redirect("/login");
});

// Define a route for page 2
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../../../Front_end/Login.html"));
});

// Handle login form submission
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send("Username and password are required");
        return;
    }

    // Find user in the list of users and passwords
    //const user = users.find(user => user.username === username && user.password === password);
    for (const user of users) {
        if (user.username == username && user.password == password) {
            // res.send(`Welcome back, ${username}!`);
            res.redirect("/main.html");
            // return;
        }
    }

    res.status(401).send("Invalid username or password");

    return;
});

// Define a route for the root URL ('/')
app.get("/main.html", (req, res) => {
    res.send(`
  <p> Welcome!</p>
`);
});

/*
function validPassword(password) {
    return !(password.length < 8 || password.includes("123") || 
  !password.includes("/" | "^" | "[" | "!" | "@" | "#" | "$" | "%" | "^" | "&" | "*" |
   "(" | ")" | "_" | "+" | "\-" | "=" | "\[" | "\]" | "{" | "}" | ";" | "'" | ":" | "\"" |
    "\\" | "|" | "," | "." | "<" | ">" | "\/" | "?" | "]" | "*" | "$" | "/<" | "/>" | ""));
}
*/

// Start the Express server and listen on port 3000
const PORT = 3001;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = server;
// module.exports = PORT;





