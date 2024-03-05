// Import required modules
const express = require('express');
const bodyParser = require('body-parser');

// Create an Express application
const app = express();

const fs = require('fs');
// Read the usernames file
const usernames = JSON.parse(fs.readFileSync('user/TEMP_userStorage.json'));

// Middleware to parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define a route for the root URL ('/')
app.get('/', (req, res) => {
  res.send(`
    <p> Welcome! Click here to get started  <a href="/Register">Register</a>.</p>
  `);
});

// Define a route for page 1
app.get('/register', (req, res) => {
  res.send(`
  <html>
  <head>
    <title>E-Invoice Storage - Registration</title>
    <style>
      body {
        text-align: center;
        font-family: Arial, sans-serif;
      }
      .title {
        font-size: 32px;
        margin-bottom: 20px;
      }
    </style>
  </head>
  <body>
    <div class="title">Anemone's E-Invoice Storage</div>
    <h1>Registration</h1>
    <form method="POST" action="/register">
      <label for="username">Username:</label><br>
      <input type="text" id="username" name="username" required><br>
      <label for="password">Password:</label><br>
      <input type="password" id="password" name="password" required><br>
      <button type="submit">Register</button>
    </form>
    <p>Already have an account? <a href="/login">Login here</a>.</p>
  </body>
  </html>
  `);
});


// Handle registration form submission
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send('Username and password are required');
    return;
  }

  // Check if username already exists
  if (usernames.includes(username)) {
    res.status(400).send('Username already exists');
    return;
  }
  /*
  // check if password is valid conditions (SECURITY PURPOSES)
  if (!validPassword(password)) {
    res.status(400).send('Password must be: greater than 8 characters, include special characters');
  }
  */
  // Add new user to the list of users
  usernames.push({ username, password });

  // Redirect to page 2 (login page)
  res.redirect('/login');
});

// Define a route for page 2
app.get('/login', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form method="POST" action="/login">
      <label for="username">Username:</label><br>
      <input type="text" id="username" name="username" required><br>
      <label for="password">Password:</label><br>
      <input type="password" id="password" name="password" required><br>
      <button type="submit">Login</button>
    </form>
    <p> Haven't signed up yet? <a href="/register">Register here!</a>.</p>
  `);
});

// Handle login form submission
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send('Username and password are required');
    return;
  }

  // Find user in the list of usernames and passwords
  const user = usernames.find(user => user.username === username && user.password === password);
  if (!user) {
    res.status(401).send('Invalid username or password');
    return;
  }

  // Redirect to a page indicating successful login
  res.send(`Welcome back, ${username}!`);
});

// Start the Express server and listen on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function validPassword(password) {
  return !(password.length < 8 || password.includes("123") || 
  !password.includes("/" | "^" | "[" | "!" | "@" | "#" | "$" | "%" | "^" | "&" | "*" |
   "(" | ")" | "_" | "+" | "\-" | "=" | "\[" | "\]" | "{" | "}" | ";" | "'" | ":" | "\"" |
    "\\" | "|" | "," | "." | "<" | ">" | "\/" | "?" | "]" | "*" | "$" | "/<" | "/>" | ""));
}

