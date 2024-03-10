// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path"); 

// Create an Express application
const app = express();

const fs = require("fs");
// Read the  files
const users = JSON.parse(fs.readFileSync("src/main/server/TEMP_userStorage.json"));
const invoices = JSON.parse(fs.readFileSync("src/main/server/TEMP_invoiceStorage.json")); 

// import Invoice Upload
const invoiceUpload = require("./invoiceUpload.js");
const userHelpers = require("./../userHelpers.js");
// const invoiceRetrieve = require("./../invoiceRetrieve.js");

// Middleware ( AI-Generated )
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../../../Front_end")));

// root URL
app.get("/", (req, res) => {
    res.send(`
    <p> Welcome! Click here to get started  <a href="/Register">Register</a>.</p>
  `);
});

// route for the registration form
app.get("/register", (req, res) => {
    const filePath = path.join(__dirname, "../../../Front_end/Register.html");
    res.sendFile(filePath);
});


// registration form submission
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send("Username and password are required");
        return;
    }

    // Check if username already exists
    if (!userHelpers.checkUserDoesntExist(username, users)) {
        res.status(400).send("Username already exists");
        return;
    }
    // Add new user to the list of users
    users.push({ username, password });

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
    if (userHelpers.checkUserInDataBase(username, password, users)) {
        res.redirect("/main.html");
        return;
    }
    res.status(401).send("Invalid username or password");
    return;
});

// Define a route for retrieving invoices
app.get("/retrieve/:invoiceId", (req, res) => {
    const { invoiceId } = req.params;

    for (const invoice of invoices) {
        if (invoiceId == invoice.invoiceId) {
            res.json(invoice);
            break;
        }
    }

    res.status(404).send("Invoice not found");

});


app.post("/upload", (req, res) => {
    const { file } = req.body;
    const response = invoiceUpload.uploadfile(file); 
    return res.json(response);
});

// Start the Express server and listen on port 3000
const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = server;
// module.exports = PORT;
