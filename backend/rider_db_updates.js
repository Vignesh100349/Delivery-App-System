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
        await client.query("ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT false;");
        console.log('Added is_online to users');
    } catch(e) { console.log(e.message) }
    try {
        await client.query("ALTER TABLE orders ADD COLUMN delivery_otp VARCHAR(10) DEFAULT '1234';");
        console.log('Added delivery_otp to orders');
    } catch(e) { console.log(e.message) }
    process.exit();
}).catch(console.error);
