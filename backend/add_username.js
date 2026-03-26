require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'grocery_db',
    password: process.env.DB_PASSWORD || 'yourpassword',
    port: process.env.DB_PORT || 5432,
});
client.connect().then(async () => {
    try {
        await client.query("ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;");
        console.log('Added username Column');
    } catch(e) {
        console.log('Already exists or error:', e.message);
    }
    process.exit();
}).catch(console.error);
