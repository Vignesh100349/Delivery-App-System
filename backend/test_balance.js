const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/grocery_db',
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        const dedu = 50.5;
        const res = await pool.query('UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + $1 WHERE id = $2 RETURNING id, wallet_balance', [dedu, 1]);
        console.log("SQL SUCCESS:", res.rows);
    } catch(e) {
        console.error("SQL ERROR:", e);
    }
    process.exit();
})();
