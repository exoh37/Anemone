function checkUserDoesntExist(username, users) {
    for (const user of users) {
        if (user.username == username) {
            return false;
        }
    }

    return true;
}

function checkUserInDataBase(username, password, users) {
    for (const user of users) {
        if (user.username == username && user.password == password) {
            return true;
        }
    }
    return false;
}

module.exports = { checkUserDoesntExist, checkUserInDataBase };