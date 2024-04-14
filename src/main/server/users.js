const validator = require("validator");

const other = require("./other.js");
const auth = require("./auth.js");
const pool = require("./database.js");

function registerUser(username, email, password) {
    // If username contains empty space
    if (/\s/.test(username)) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `Username '${username}' contains a whitespace character`
            }
        };
    }

    /*
     * If password does not conform to regex
     * Regex taken from stackoverflow
     */
    const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!regex.test(password)) {
        return {
            code: 400,
            ret: {
                success: false,
                error: "Password does not satisfy minimum requirements (at least 8 characters long, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number)"
            }
        };
    }

    // Check if the username is 3-20 characters long
    if (username.length < 3 || username.length > 20) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `Username '${username}' is not between 3-20 characters long`
            }
        };
    }

    // Check if email is valid
    if (!validator.isEmail(email)) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `Email '${email}' is not a valid email address`
            }
        };
    }

    // Check if username or email was taken
    const jsonData = other.getUserData();
    for (const user of jsonData) {
        if (user.username === username) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: `Username '${username}' was taken by another user`
                }
            };
        }

        if (user.email === email) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: `Email '${email}' was taken by another user`
                }
            };
        }
    }

    // Checks complete, add user
    jsonData.push({
        username,
        email,
        password
    });

    other.setUserData(jsonData);

    return {
        code: 200,
        ret: {
            success: true
        }
    };
}

function loginUser (username, password) {
    const jsonData = other.getUserData();
    const user = jsonData.find(user => user.username === username);

    if (user === undefined) {
        return {
            code: 401,
            ret: {
                success: false,
                error: `Username '${username}' does not refer to an existing user`
            }
        };
    }

    if (user.password !== password) {
        return {
            code: 401,
            ret: {
                success: false,
                error: `Password does not match username '${username}'`
            }
        };
    }

    return {
        code: 200,
        ret: {
            success: true,
            token: auth.generateToken(username)
        }
    };
}

async function registerUserV2(username, email, password) {
    // If username contains empty space
    if (/\s/.test(username)) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `Username '${username}' contains a whitespace character`
            }
        };
    }

    /*
     * If password does not conform to regex
     * Regex taken from stackoverflow
     */
    const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!regex.test(password)) {
        return {
            code: 400,
            ret: {
                success: false,
                error: "Password does not satisfy minimum requirements (at least 8 characters long, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number)"
            }
        };
    }

    // Check if the username is 3-20 characters long
    if (username.length < 3 || username.length > 20) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `Username '${username}' is not between 3-20 characters long`
            }
        };
    }

    // Check if email is valid
    if (!validator.isEmail(email)) {
        return {
            code: 400,
            ret: {
                success: false,
                error: `Email '${email}' is not a valid email address`
            }
        };
    }

    // Check if username or email was taken
    const client = await pool.connect();
    try {
        const users = await client.query("SELECT username FROM users WHERE username = $1", [username]);
        if (users.rows.length !== 0) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: `Username '${username}' was taken by another user`
                }
            };
        }

        const emails = await client.query("SELECT email FROM users WHERE email = $1", [email]);
        if (emails.rows.length !== 0) {
            return {
                code: 400,
                ret: {
                    success: false,
                    error: `Email '${email}' was taken by another user`
                }
            };
        }

        const text = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *";
        const values = [username, email, password];
        await client.query(text, values);

        return {
            code: 200,
            ret: {
                success: true
            }
        };
    } catch (error) {
        console.error("Failed to register user:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function loginUserV2(username, password) {
    const client = await pool.connect();
    try {
        const users = await client.query("SELECT * FROM users WHERE username = $1", [username]);
        if (users.rows.length === 0) {
            return {
                code: 401,
                ret: {
                    success: false,
                    error: `Username '${username}' does not refer to an existing user`
                }
            };
        }

        if (users.rows[0].password !== password) {
            return {
                code: 401,
                ret: {
                    success: false,
                    error: `Password does not match username '${username}'`
                }
            };
        }

        const token = await auth.generateTokenV2(username);

        return {
            code: 200,
            ret: {
                success: true,
                token: token
            }
        };
    } catch (error) {
        console.error("Failed to login user:", error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { registerUser, loginUser, registerUserV2, loginUserV2 };
