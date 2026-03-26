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
        const dummyPhone = 'RIDER_' + Date.now().toString().substring(5);
        const result = await client.query("INSERT INTO users(name, username, phone, password, role) VALUES('Delivery Partner', 'test_user', $1, 'pass', 'rider') RETURNING id, username", [dummyPhone]);
        console.log(result.rows);
    } catch(e) {
        console.error('ERROR DB:', e.message);
    }
    process.exit();
});
