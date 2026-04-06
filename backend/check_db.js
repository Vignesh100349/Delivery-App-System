require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const cats = await pool.query('SELECT * FROM categories;');
    console.log("CATEGORIES:", cats.rows);

    const prods = await pool.query('SELECT id, name, category_id, image FROM products LIMIT 50;');
    console.log("PRODUCTS SAMPLED:", prods.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
