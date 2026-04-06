const axios = require('axios');
const google = require('googlethis');

const API_URL = 'https://delivery-app-system.onrender.com';

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function main() {
  try {
    console.log("Fetching all products from production...");
    const res = await axios.get(`${API_URL}/products`);
    const products = res.data;
    
    // Filter out products that already have a real image
    const needsUpdate = products.filter(p => !p.image || p.image.includes('flaticon') || p.image === '');
    console.log(`Found ${needsUpdate.length} products needing image mapping.`);

    let count = 0;
    for (const prod of needsUpdate) {
      count++;
      let prodName = prod.name;
      
      // We know all these 175 items are Vegetables based on seed.
      // But if there's milk or bread, we could re-allocate. 
      // For now, let's keep them in category 1 (Vegetables) unless explicitly matched.
      let newCat = prod.category_id || "1";
      const nameL = prodName.toLowerCase();
      if (nameL.includes('milk') || nameL.includes('paneer') || nameL.includes('curd')) newCat = "2";
      if (nameL.includes('chips') || nameL.includes('doritos')) newCat = "3";
      
      console.log(`[${count}/${needsUpdate.length}] Searching image for: ${prodName}...`);
      
      let fetchedUrl = prod.image;
      try {
        const query = `${prodName.replace(/\(.*?\)/g, '')} bigbasket instamart vegetable transparent`;
        const images = await google.image(query, { safe: false });
        if (images && images.length > 0) {
          fetchedUrl = images[0].url;
          // Avoid gstatic base64 / encrypted urls
          if (fetchedUrl === null || fetchedUrl.includes("gstatic")) {
              fetchedUrl = images[1] ? images[1].url : null;
          }
        }
      } catch (err) {
        console.log(`Google API Error for ${prodName}:`, err.message);
      }

      if (fetchedUrl && fetchedUrl !== prod.image) {
        try {
          const payload = {
            name: prod.name,
            price: prod.price,
            original_price: prod.original_price,
            image: fetchedUrl,
            category_id: newCat,
            description: prod.description || '',
            stock: prod.stock || 100
          };
          await axios.put(`${API_URL}/products/${prod.id}`, payload);
          console.log(`-> SUCCESS: category_id=${newCat}, image=${fetchedUrl.substring(0, 40)}...`);
        } catch (updateErr) {
          console.log(`-> FAILED TO UPDATE DB:`, updateErr.message);
        }
      } else {
        console.log(`-> SKIPPED (No valid image found)`);
      }

      await sleep(1500); // Respect rate limits
    }

    console.log("ALL ONLINE IMAGES FETCHED AND PRODUCTS ALLOCATED.");
  } catch(err) {
    console.error("FATAL ERROR:", err.message);
  }
}

main();
