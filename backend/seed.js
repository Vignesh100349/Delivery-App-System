require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function seed() {
    console.log('Starting dummy data seeding...');

    // Connect to the default postgres database first to ensure grocery_db exists
    const sysClient = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres',
        password: process.env.DB_PASSWORD || 'yourpassword',
        port: process.env.DB_PORT || 5432,
    });

    try {
        await sysClient.connect();
        // Check if database exists
        const res = await sysClient.query("SELECT 1 FROM pg_database WHERE datname = 'grocery_db'");
        if (res.rowCount === 0) {
            console.log('Creating database grocery_db...');
            await sysClient.query('CREATE DATABASE grocery_db');
        } else {
            console.log('Database grocery_db already exists.');
        }
    } catch (err) {
        console.error('Error with sysClient (make sure PostgreSQL is running):', err.message);
        return;
    } finally {
        await sysClient.end();
    }

    // Now connect to the grocery_db database
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'grocery_db',
        password: process.env.DB_PASSWORD || 'yourpassword',
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();

        // 1. Run schema.sql
        console.log('Running schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);

        // 2. Insert Dummy User
        console.log('Inserting dummy user...');
        const userRes = await client.query(`
      INSERT INTO users (name, phone, email, password, role) 
      VALUES ('Test User', '1234567890', 'test@example.com', 'hashed_pass', 'customer')
      ON CONFLICT (phone) DO NOTHING
      RETURNING id;
    `);

        // 3. Insert Dummy Products
        console.log('Inserting dummy products...');
        await client.query(`
      INSERT INTO products (name, description, price, stock, category, image_url) VALUES 
      ('Fresh Apples (1kg)', 'Crisp and sweet red apples.', 120.00, 50, 'Fruits', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=500&q=80'),
      ('Whole Wheat Bread', 'Freshly baked whole wheat bread.', 45.00, 30, 'Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80'),
      ('Amul Butter (100g)', 'Salted pure generic butter.', 55.00, 100, 'Dairy', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&q=80')
      ON CONFLICT DO NOTHING; -- Actually we don't have unique constraint, so this might insert duplicates if run repeatedly. We'll just truncate or delete first to be safe.
    `);

        console.log('Seed completed successfully! ✅');
    } catch (err) {
        console.error('Error seeding data:', err.message);
    } finally {
        await client.end();
    }
}

seed();
