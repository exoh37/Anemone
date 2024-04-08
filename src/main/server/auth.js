const other = require("./other.js");
const pool = require("./database.js");
const parseString = require("xml2js").parseString;

// Constants
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Generate a unique token wtih expiration time and adds it to the valid tokens list
function generateToken(username) {
    const timestamp = Date.now(),
        // Expiration time of 1 day from now
        expiration = timestamp + ONE_DAY_MS,
        // Generates a base-36 string and then extracts 16 digits
        tokenString = Math.random().toString(36).substring(2,17),
        tokenId = `${timestamp}_${tokenString}`,

        jsonData = other.getTokenData();

    jsonData.push({
        tokenId,
        username,
        expiration
    });

    other.setTokenData(jsonData);

    return tokenId;
}

// Authenticates that a token is valid, returns a boolean value + corresponding user
function tokenIsValid(tokenId) {
    const jsonData = other.getTokenData(),
        token = jsonData.find(token => token.tokenId === tokenId);

    // Could not find token or token has expired
    if (token === undefined || token.expiration < Date.now()) {
        return {
            valid: false
        };
    }

    return {
        valid: true,
        username: token.username
    };
}

async function generateTokenV2(username) {
    const client = await pool.connect();
    const timestamp = Date.now();
    // Expiration time of 1 day from now
    const expiration = timestamp + ONE_DAY_MS;
    // Generates a base-36 string and then extracts 16 digits
    const tokenString = Math.random().toString(36).substring(2,17);
    const tokenId = `${timestamp}_${tokenString}`;
    try {
        await client.query(`
        INSERT INTO tokens (tokenId, username, expiration)
        VALUES ($1, $2, $3)
        `, [tokenId, username, expiration]);
        return tokenId;
    } catch (error) {
        console.error("Failed to generate token:", error);
        throw error;
    } finally {
        client.release();
    }
}

// Authenticates that a token is valid, returns a boolean value + corresponding user
async function tokenIsValidV2(tokenId) {
    const client = await pool.connect();
    try {
        const token = await client.query("SELECT * FROM tokens WHERE tokens.tokenId = $1", [tokenId]);

        // Could not find token
        if (token.rows.length === 0) {
            return {
                valid: false
            };
        }

        // Token has expired
        if (token.rows[0].expiration < Date.now()) {
            return {
                valid: false
            };
        }

        return {
            valid: true,
            username: token.rows[0].username
        };
    } catch (error) {
        console.error("Failed to validate token:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function fetchXMLData(invoiceId) {
    const client = await pool.connect();
    try {
        const invoice = await client.query("SELECT * FROM invoices i WHERE i.invoiceId = $1", [invoiceId]);
        const xml = invoice.rows[0].invoice;
        let res;
        parseString(xml, function (err, result) {
            res = result;
        });
        return res;
    } catch (error) {
        console.error("Failed to fetch XML data:", error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { generateToken, tokenIsValid, generateTokenV2, tokenIsValidV2, fetchXMLData };