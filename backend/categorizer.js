require('dotenv').config();
const { Pool } = require('pg');
const google = require('googlethis');

const pool = new Pool({
  connectionString: 'postgresql://nand_db_user:S8iWk3X7s68oB7Z0RtzQ8O2FvG0wT7Tj@dpg-cv31t59u0jms739f8i60-a.oregon-postgres.render.com/nand_db?ssl=true' 
});

const categoryMap = {
  "Root Vegetables": ["potato", "onion", "carrot", "beetroot", "garlic", "ginger", "radish", "turnip", "arvi", "yam", "colocasia", "haldi", "turmeric", "sweet potato"],
  "Leafy Greens": ["spinach", "coriander", "lettuce", "cabbage", "mint", "rocket", "bok choy", "curry leav", "basil", "parsley", "celery", "lemongrass", "kaffir lime", "palak", "dhaniya", "patta gobhi", "pudina"],
  "Gourds & Squash": ["gourd", "pumpkin", "zucchini", "tinda", "squash", "parwal", "lauki", "karela"],
  "Mushroom & Sprouts": ["mushroom", "sprout", "kukurmutta"],
  "Exotic & Premium": ["broccoli", "cherry tomato", "sweet bell pepper", "iceberg", "snacking", "hydroponic", "cremini", "sweet corn", "baby corn"],
  "Fruits": ["apple", "banana", "guava", "orange", "grape", "mango", "pomegranate", "lemon", "amla", "jackfruit", "sweet melon"],
  "General Vegetables": ["tomato", "tamatar", "chilli", "mirch", "capsicum", "brinjal", "baingan", "lady finger", "bhindi", "cauliflower", "phool gobhi", "beans", "matar", "drumstick", "sahjan", "cucumber", "kheera"]
};

// Sleep utility to prevent rate limit
const sleep = ms => new Promise(res => setTimeout(res, ms));

async function main() {
  try {
    console.log("Fetching existing categories...");
    // 1. Ensure categories exist
    const catKeys = Object.keys(categoryMap);
    catKeys.push("General Vegetables");
    catKeys.push("Groceries");
    
    // Check missing ones and insert them
    const existingCats = await pool.query('SELECT * FROM categories');
    const existingNames = existingCats.rows.map(c => c.name ? c.name.toLowerCase() : "");
    
    for (const catName of catKeys) {
      if (!existingNames.includes(catName.toLowerCase())) {
        console.log(`Inserting category: ${catName}`);
        await pool.query("INSERT INTO categories(name, image) VALUES($1, '') ON CONFLICT (name) DO NOTHING;", [catName]);
      }
    }

    // Load category mapping
    const allCategories = await pool.query('SELECT id, name FROM categories');
    const nameToCatId = {};
    allCategories.rows.forEach(r => { 
        if(r.name) nameToCatId[r.name.toLowerCase()] = r.id; 
    });

    console.log("Fetching products that need updates...");
    const prods = await pool.query("SELECT id, name FROM products WHERE image LIKE '%flaticon.com%' OR image IS NULL OR image = '';");
    
    console.log(`Found ${prods.rows.length} products to update. Process starting...`);

    let i = 0;
    for (const prod of prods.rows) {
      i++;
      let prodName = prod.name;
      let matchedCatName = "General Vegetables"; // fallback

      // 1. Determine Category String
      let pLower = prodName.toLowerCase();
      for (const [catName, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(kw => pLower.includes(kw))) {
          matchedCatName = catName;
          break;
        }
      }

      const catId = nameToCatId[matchedCatName.toLowerCase()] || nameToCatId["general vegetables"];

      // 2. Fetch Image from Google
      let fetchedUrl = null;
      try {
        const query = `${prodName.replace(/\(.*?\)/g, '')} bigbasket instamart product`;
        const images = await google.image(query, { safe: false });
        // Pick the first reliable image (often transparent background products)
        if (images && images.length > 0) {
          fetchedUrl = images[0].url;
          if (fetchedUrl === null || fetchedUrl.includes("gstatic")) {
              fetchedUrl = images[1] ? images[1].url : null;
          }
        }
      } catch (err) {
        console.log(`Error fetching image for ${prodName}:`, err.message);
      }

      // 3. Update DB
      if (fetchedUrl) {
          await pool.query("UPDATE products SET category_id = $1, image = $2 WHERE id = $3", [catId, fetchedUrl, prod.id]);
          console.log(`[${i}/${prods.rows.length}] Updated ${prodName} -> Cat: ${matchedCatName} | Image: OK`);
      } else {
          await pool.query("UPDATE products SET category_id = $1 WHERE id = $2", [catId, prod.id]);
          console.log(`[${i}/${prods.rows.length}] Updated ${prodName} -> Cat: ${matchedCatName} | NO IMAGE FETCHED`);
      }

      // Respect basic rate limiting (wait 1 second between search API queries)
      await sleep(1500); 
    }

    console.log("ALL PRODUCTS UPDATED SUCCESSFULLY AND CATEGORIZED CLEANLY.");
  } catch(err) {
    console.error("FATAL SCRIPT ERROR:", err);
  } finally {
    pool.end();
  }
}

main();
