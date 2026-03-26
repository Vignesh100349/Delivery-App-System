require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'grocery_db',
    password: process.env.DB_PASSWORD || 'yourpassword',
});
client.connect().then(async () => {
    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'`);
    console.log(res.rows.map(r=>r.column_name).join(', '));
    client.end();
});
