const {Pool} = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

module.exports = pool;