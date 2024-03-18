const other = require("./other.js");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Generate a unique token wtih expiration time and adds it to the valid tokens list
function generateToken(username) {
    const timestamp = Date.now();
    // Expiration time of 1 day from now
    const expiration = timestamp + ONE_DAY_MS;
    // Generates a base-36 string and then extracts 16 digits
    const tokenString = Math.random().toString(36).substring(2,17);
    const tokenId = `${timestamp}_${tokenString}`;
    
    const jsonData = other.getTokenData();

    jsonData.push({
        tokenId: tokenId,
        username: username,
        expiration: expiration
    });

    other.setTokenData(jsonData);

    return tokenId;
}

// Authenticates that a token is valid, returns a boolean value + corresponding user
function tokenIsValid(tokenId) {
    const jsonData = other.getTokenData();
    const token = jsonData.find(token => token.tokenId === tokenId);

    // Could not find token
    if (token === undefined) {
        return {
            valid: false
        };
    }

    // Token has expired
    if (token.expiration < Date.now()) {
        return {
            valid: false
        };
    }

    return {
        valid: true,
        username: token.username
    };
}

module.exports = { generateToken, tokenIsValid };