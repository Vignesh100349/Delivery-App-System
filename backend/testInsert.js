require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'grocery_db',
    password: process.env.DB_PASSWORD || 'yourpassword',
});
client.connect().then(async () => {
    try {
        const phone = '9991113333';
        const defaultPassword = 'Loopie$123';
        const result = await client.query(
            "INSERT INTO users(name, username, phone, password, role) VALUES('Delivery Partner', $1, $1, $2, 'rider') RETURNING id, phone",
            [phone, defaultPassword]
        );
        console.log("Success:", result.rows);
    } catch(err) {
        console.log("ERROR:", err.message);
    }
    client.end();
});
