const {Pool} = require("pg");
const pg = require("pg");
pg.defaults.parseInt8 = true;
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "Anemone123",
    database: "anemone"
});

module.exports = pool;