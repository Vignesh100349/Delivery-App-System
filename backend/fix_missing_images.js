const axios = require('axios');
const google = require('googlethis');
const API_URL = 'https://delivery-app-system.onrender.com';

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function run() {
    try {
        console.log('Fetching all products to fix Unsplash fallbacks...');
        const res = await axios.get(API_URL + '/products');
        const products = res.data;
        
        // Find products with Unsplash images
        const toFix = products.filter(p => p.image && p.image.includes('unsplash'));
        console.log(`Found ${toFix.length} products needing exact isolated images...`);

        for (let i=0; i<toFix.length; i++) {
            const p = toFix[i];
            const cleanName = p.name.replace(/\([a-zA-Z0-9\s-]+\)/g, '').split('-')[0].trim();
            const query = `${cleanName} isolated transparent background png`;
            
            console.log(`[${i+1}/${toFix.length}] Searching: "${query}"`);
            try {
                const images = await google.image(query, { safe: false });
                if (images && images.length > 0) {
                    let bestUrl = null;
                    // Find highest quality, non-gstatic image
                    for (const img of images) {
                        if (!img.url.includes('gstatic') && !img.url.includes('base64') && img.url.endsWith('.png')) {
                            bestUrl = img.url;
                            break;
                        }
                    }
                    if (!bestUrl) { // fallback if no explicit png
                         for (const img of images) {
                            if (!img.url.includes('gstatic') && !img.url.includes('base64')) {
                                bestUrl = img.url;
                                break;
                            }
                        }
                    }

                    if (bestUrl) {
                        await axios.put(API_URL + `/products/${p.id}`, {
                            name: p.name,
                            price: p.price,
                            original_price: p.original_price,
                            category_id: p.category_id,
                            description: p.description,
                            stock: p.stock,
                            image: bestUrl
                        });
                        console.log(`  -> SUCCESS! Found image: ${bestUrl.substring(0, 50)}...`);
                    } else {
                        console.log(`  -> No valid image formats found for ${cleanName}`);
                    }
                }
            } catch(e) {
                console.log(`  -> Google search failed for ${cleanName}:`, e.message);
            }
            
            await sleep(2000); // 2 second delay to avoid rate limiting
        }
        
        console.log('Done mapping exact unique images!');
    } catch(err) {
        console.error(err);
    }
}
run();
