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
    await client.query("INSERT INTO users (name, phone, password, role) VALUES ('Alpha Rider', '9876543210', 'admin123', 'rider') ON CONFLICT DO NOTHING");
    console.log('Rider Seeded');
    process.exit();
}).catch(console.error);
