require('dotenv').config();
const { Client } = require('pg');

async function seedBlinkitCatalog() {
    console.log('Clearing old catalog and injecting Blinkit-style HD database...');

    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'grocery_db',
        password: process.env.DB_PASSWORD || 'yourpassword',
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();

        // Truncate existing products to avoid duplicates when running multiple times
        await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');

        const blinkitCatalog = [
            // CATEGORY 1: Vegetables
            { category_id: '1', name: 'Onion', desc: '1 kg', price: 35, original: 45, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80' },
            { category_id: '1', name: 'Tomato - Hybrid', desc: '500 g', price: 25, original: 30, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80' },
            { category_id: '1', name: 'Potato (Aloo)', desc: '1 kg', price: 40, original: 55, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80' },
            { category_id: '1', name: 'Coriander Leaves', desc: '100 g', price: 15, original: 20, image: 'https://images.unsplash.com/photo-1627582236528-6627f12e2d93?w=500&q=80' },
            { category_id: '1', name: 'Green Chilli', desc: '100 g', price: 12, original: 18, image: 'https://images.unsplash.com/photo-1596547609652-9ea5b8d002f5?w=500&q=80' },
            
            // CATEGORY 2: Fruits
            { category_id: '2', name: 'Banana - Robusta', desc: '6 pcs', price: 45, original: 60, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&q=80' },
            { category_id: '2', name: 'Apple - Royal Gala', desc: '4 pcs', price: 140, original: 180, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=500&q=80' },
            { category_id: '2', name: 'Papaya - Semi Ripe', desc: '1 pc (800g-1kg)', price: 79, original: 99, image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500&q=80' },
            { category_id: '2', name: 'Watermelon - Kiran', desc: '1 pc (2.5-3kg)', price: 110, original: 140, image: 'https://images.unsplash.com/photo-1582281269389-49dd815467db?w=500&q=80' },

            // CATEGORY 3: Dairy & Breakfast
            { category_id: '3', name: 'Amul Taaza Toned Milk', desc: '500 ml', price: 27, original: 27, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80' },
            { category_id: '3', name: 'Mother Dairy Classic Curd', desc: '400 g', price: 35, original: 35, image: 'https://images.unsplash.com/photo-1574163989390-1edb015e100d?w=500&q=80' },
            { category_id: '3', name: 'Amul Salted Butter', desc: '100 g', price: 60, original: 60, image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&q=80' },
            { category_id: '3', name: 'Amul Cheese Slices', desc: '200 g (10 slices)', price: 135, original: 145, image: 'https://images.unsplash.com/photo-1631505362575-d249fef7535b?w=500&q=80' },
            { category_id: '3', name: 'Farm Fresh White Eggs', desc: '6 pcs', price: 48, original: 55, image: 'https://images.unsplash.com/photo-1598965675045-45c5e72e1282?w=500&q=80' },

            // CATEGORY 5: Munchies
            { category_id: '5', name: 'Lays Magic Masala Potato Chips', desc: '50 g', price: 20, original: 20, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80' },
            { category_id: '5', name: 'Kurkure Masala Munch', desc: '90 g', price: 20, original: 20, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&q=80' },
            { category_id: '5', name: 'Haldirams Aloo Bhujia', desc: '200 g', price: 55, original: 60, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80' },
            { category_id: '5', name: 'Doritos Nacho Cheese', desc: '60 g', price: 30, original: 30, image: 'https://images.unsplash.com/photo-1613919113640-25732cea5e79?w=500&q=80' },
            
            // CATEGORY 6: Cold Drinks & Juices
            { category_id: '6', name: 'Coca-Cola Original Taste', desc: '750 ml', price: 40, original: 40, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
            { category_id: '6', name: 'Thums Up Soft Drink', desc: '750 ml', price: 40, original: 40, image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=500&q=80' },
            { category_id: '6', name: 'Sprite Lemon-Lime', desc: '750 ml', price: 40, original: 40, image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&q=80' },
            { category_id: '6', name: 'Real Fruit Power Mixed Fruit', desc: '1 L', price: 115, original: 125, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80' },
            { category_id: '6', name: 'Red Bull Energy Drink', desc: '250 ml', price: 125, original: 125, image: 'https://images.unsplash.com/photo-1622359520993-90dcae650800?w=500&q=80' },

            // CATEGORY 7: Instant & Frozen Food
            { category_id: '7', name: 'Maggi 2-Minute Masala Noodles', desc: '70 g', price: 14, original: 14, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80' },
            { category_id: '7', name: 'Yippee Magic Masala Noodles', desc: '60 g', price: 12, original: 12, image: 'https://images.unsplash.com/photo-1606555191147-19aa827b5e43?w=500&q=80' },
            { category_id: '7', name: 'McCain Smiley Potato Bites', desc: '415 g', price: 140, original: 160, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&q=80' },
            { category_id: '7', name: 'Amul Veg Burger Patty', desc: '400 g', price: 155, original: 170, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80' },
            { category_id: '7', name: 'ID Idly Dosa Batter', desc: '1 kg', price: 85, original: 90, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80' },

            // CATEGORY 8: Tea, Coffee & Health Drinks
            { category_id: '8', name: 'Brooke Bond Red Label Tea', desc: '500 g', price: 230, original: 265, image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80' },
            { category_id: '8', name: 'Tata Tea Premium', desc: '500 g', price: 215, original: 240, image: 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd1?w=500&q=80' },
            { category_id: '8', name: 'Nescafe Classic Instant Coffee', desc: '50 g', price: 170, original: 180, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80' },
            { category_id: '8', name: 'Bru Instant Coffee Powder', desc: '50 g', price: 105, original: 110, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80' },
            { category_id: '8', name: 'Bournvita Chocolate Health Drink', desc: '500 g', price: 210, original: 225, image: 'https://images.unsplash.com/photo-1615486171434-22b91950e4ed?w=500&q=80' },

            // CATEGORY 9: Bakery & Biscuits
            { category_id: '9', name: 'Harvest Gold White Bread', desc: '400 g', price: 40, original: 40, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80' },
            { category_id: '9', name: 'Britannia Good Day Cashew', desc: '600 g', price: 110, original: 120, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80' },
            { category_id: '9', name: 'Parle-G Gold Biscuits', desc: '1 kg', price: 95, original: 100, image: 'https://images.unsplash.com/photo-1558024920-b41e1887dc32?w=500&q=80' },
            { category_id: '9', name: 'Oreo Original Vanilla Creme', desc: '120 g', price: 35, original: 35, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80' }, // Reused generic biscuit image

            // CATEGORY 10: Sweet Tooth
            { category_id: '10', name: 'Dairy Milk Silk Chocolate', desc: '60 g', price: 85, original: 85, image: 'https://images.unsplash.com/photo-1548883354-94cbdec8ec32?w=500&q=80' },
            { category_id: '10', name: 'Kwality Wall\'s Cornetto', desc: '115 ml', price: 60, original: 60, image: 'https://images.unsplash.com/photo-1559703248-dcaaec9fab78?w=500&q=80' },
            { category_id: '10', name: 'Haldiram Rasgulla Tin', desc: '1 kg', price: 220, original: 240, image: 'https://images.unsplash.com/photo-1632766863004-9842bfb34eb3?w=500&q=80' },
            { category_id: '10', name: 'Amul Choco Lava Cake', desc: '2 pcs', price: 90, original: 100, image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&q=80' }
        ];

        let i = 1;
        for (const p of blinkitCatalog) {
            await client.query(
                `INSERT INTO products (name, description, price, original_price, stock, category_id, image) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [p.name, p.desc, p.price, p.original, 100, p.category_id, p.image] // Standardize 100 stock
            );
            console.log(`[${i}/${blinkitCatalog.length}] Inserted: ${p.name}`);
            i++;
        }

        console.log('--- SEEDING COMPLETE ---');
        console.log(`Successfully mapped ${blinkitCatalog.length} High Definition products into PostgreSQL.`);

    } catch (err) {
        console.error('CRITICAL: Seed failure:', err.message);
    } finally {
        await client.end();
    }
}

seedBlinkitCatalog();
