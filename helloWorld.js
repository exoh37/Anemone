// Import required modules
const express = require('express');
const bodyParser = require('body-parser');

// Create an Express application
const app = express();

const fs = require('fs');
// Read the usernames file
const usernames = JSON.parse(fs.readFileSync('user/userName.json'));

// Middleware to parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define a route for the root URL ('/')
app.get('/', (req, res) => {
  res.send(`
    <h1> Welcome to Anemone Invoice Storage!</h1>
    <h2> Register new user </h2>
    <form method="POST" action="/check-username">
      <label for="username">Enter your username:</label><br>
      <input type="text" id="username" name="username"><br>
      <button type="submit">Submit</button>
    </form>
  `);
});

// Define a route for handling form submissions
app.post('/check-username', (req, res) => {
  const { username } = req.body;
  if (!username) {
    res.status(400).send('Username is required');
    return;
  }

  if (isUsernameTaken(username)) {
    res.send(`${username} is already taken`);
  } else {
    res.send(`${username} is available`);
  }
});

function isUsernameTaken(username) {
  return usernames.includes(username);
}

// Start the Express server and listen on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});