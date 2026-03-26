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
        await client.query("ALTER TABLE orders ADD COLUMN delivery_partner_id INT REFERENCES users(id) ON DELETE SET NULL;");
        console.log('Added delivery_partner_id to orders table');
    } catch(e) {
        console.log('Already applies or error:', e.message);
    }
    process.exit();
}).catch(console.error);
