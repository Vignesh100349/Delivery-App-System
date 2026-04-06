const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:jKqCqAONmIqTnjFwWpEQCszXgMtsZgXy@autorack.proxy.rlwy.net:19760/railway',
});

async function run() {
  try {
    const res = await pool.query('SELECT * FROM products');
    const products = res.rows;
    
    // Group by lowercase name
    const grouped = {};
    for(const p of products) {
        const n = p.name.toLowerCase().trim();
        if(!grouped[n]) grouped[n] = [];
        grouped[n].push(p);
    }
    
    let deletedCount = 0;
    
    for(const name in grouped) {
        const items = grouped[name];
        if(items.length > 1) {
            // Sort by whether image exists, then by ID
            items.sort((a, b) => {
                const aHasImg = a.image && a.image.length > 10 ? 1 : 0;
                const bHasImg = b.image && b.image.length > 10 ? 1 : 0;
                if(aHasImg !== bHasImg) return bHasImg - aHasImg;
                return b.id - a.id;
            });
            
            // Keep the first one 
            const keepers = items.slice(0, 1);
            const losers = items.slice(1);
            
            for(const l of losers) {
                console.log('Deleting duplicate: ', l.name, 'ID:', l.id);
                // Important: must also delete cart/order items if necessary or CASCADE will handle it
                await pool.query('DELETE FROM products WHERE id = ', [l.id]);
                deletedCount++;
            }
        }
    }
    
    console.log('Finished removing ' + deletedCount + ' duplicate products!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

run();
