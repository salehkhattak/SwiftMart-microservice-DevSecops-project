const {Pool} = require("pg");
require("dotenv").config();

const useSsl = process.env.DB_SSL === "true";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
});

pool.connect()
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log(err));
    

module.exports = pool;
