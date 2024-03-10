const fs = require("fs");
const users = JSON.parse(fs.readFileSync("src/main/server/TEMP_userStorage.json"));

export function validateUserExists(username, password) {
    for (const user of users) {
        if (user.username == username && user.password == password) {
            return true;
        }
    }
    return false;
}
