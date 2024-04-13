const {Pool} = require("pg");
const pg = require("pg");
pg.defaults.parseInt8 = true;
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
});

module.exports = pool;