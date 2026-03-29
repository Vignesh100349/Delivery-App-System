const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// The file has a duplicate "})" at the end due to my previous multi_replace mistake.
// Let's replace the whole bottom section cleanly!

const searchCode = `})

app.get('/reset100', async (req, res) => {
  try {
    const result = await pool.query('UPDATE products SET stock = 100;');
    res.json({ success: true, updated: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(\`Server running on port \${PORT}\`))`;

const replaceCode = `app.get('/reset100', async (req, res) => {
  try {
    const defaultImage = 'https://cdn-icons-png.flaticon.com/512/3143/3143643.png';
    await pool.query("UPDATE products SET stock = 100 WHERE stock IS NULL OR stock <= 0;");
    await pool.query("UPDATE products SET image = $1 WHERE image IS NULL OR image = '';", [defaultImage]);
    await pool.query("UPDATE products SET category_id = 1 WHERE category_id IS NULL AND name ILIKE '%';");
    await pool.query("UPDATE products SET description = '1 kg' WHERE description IS NULL;");
    res.json({ success: true, message: "Inventory Stock and Metadata Perfectly Synchronized!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(\`Server running on port \${PORT}\`))`;

if(code.includes("UPDATE products SET stock = 100;")) {
  code = code.replace(searchCode, replaceCode);
} else {
  // If it's already fixed or using the original format
  code = code.replace("pool.query('UPDATE products SET stock = 100;');", `pool.query("UPDATE products SET stock = 100 WHERE stock IS NULL OR stock <= 0;");
    await pool.query("UPDATE products SET image = 'https://cdn-icons-png.flaticon.com/512/3143/3143643.png' WHERE image IS NULL OR image = '';");
    await pool.query("UPDATE products SET category_id = 1 WHERE category_id IS NULL AND name ILIKE '%';");
    await pool.query("UPDATE products SET description = '1 kg' WHERE description IS NULL;");`);
}

// Clean up extraneous trailing braces if any
code = code.replace(/}\)\r?\n}\)\r?\n/g, "})\n\n");

fs.writeFileSync('server.js', code);
console.log("Server.js patched cleanly!");
