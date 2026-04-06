const axios = require('axios');
const API_URL = 'https://delivery-app-system.onrender.com';

async function run() {
    try {
        console.log('Fetching all products...');
        const res = await axios.get(API_URL + '/products');
        const products = res.data;
        
        // 1. Remove Exact Duplicates (by name)
        const nameMap = new Map();
        const duplicates = [];
        const toKeep = [];

        for (const p of products) {
            const lowerName = p.name.trim().toLowerCase();
            if (nameMap.has(lowerName)) {
                // If it already exists, flag this as duplicate
                duplicates.push(p);
            } else {
                nameMap.set(lowerName, p);
                toKeep.push(p);
            }
        }

        console.log(`Found ${duplicates.length} duplicate products. Deleting...`);
        for (const d of duplicates) {
            try {
                await axios.delete(API_URL + `/products/${d.id}`);
                console.log(`Deleted duplicate: ${d.name}`);
            } catch(e) {
                console.log(`Could not delete ${d.id}`, e.message);
            }
        }

        // 2. Correct categories intelligently
        for (const p of toKeep) {
            let cat = '1';
            let nameL = p.name.toLowerCase();
            let img = p.image;
            
            // Smarter category allocation
            if (nameL.includes('milk') || nameL.includes('curd') || nameL.includes('paneer') || nameL.includes('cheese') || nameL.includes('butter') || nameL.includes('bread') || nameL.includes('egg') || nameL.includes('yakult') || nameL.includes('yoghurt')) {
                cat = '2';
            } else if (nameL.includes('chips') || nameL.includes('doritos') || nameL.includes('lays') || nameL.includes('kurkure') || nameL.includes('popcorn') || nameL.includes('bhujia') || nameL.includes('puffs') || nameL.includes('makhana') || nameL.includes('nachos') || nameL.includes('mixture') || nameL.includes('soya sticks')) {
                cat = '3';
            } else if (nameL.includes('pepsi') || nameL.includes('coke') || nameL.includes('cola') || nameL.includes('juice') || nameL.includes('red bull') || nameL.includes('soda') || nameL.includes('mazaa') || nameL.includes('slice') || nameL.includes('water') || nameL.includes('sprite') || nameL.includes('limca') || nameL.includes('thums up') || nameL.includes('paper boat')) {
                cat = '4';
            } else if (nameL.includes('maggi') || nameL.includes('noodles') || nameL.includes('pasta') || nameL.includes('fries') || nameL.includes('frozen') || nameL.includes('yippee') || nameL.includes('mccain') || nameL.includes('kellogg') || nameL.includes('chocos') || nameL.includes('oats') || nameL.includes('muesli') || nameL.includes('corn flakes') || nameL.includes('vermicelli')) {
                cat = '5';
            } else if (nameL.includes('coffee') || nameL.includes('tea') || nameL.includes('boost') || nameL.includes('horlicks') || nameL.includes('bournvita') || nameL.includes('complan') || nameL.includes('protinex')) {
                cat = '6';
            } else if (nameL.includes('biscuit') || nameL.includes('cookie') || nameL.includes('cake') || nameL.includes('rusk') || nameL.includes('croissant') || nameL.includes('bun') || nameL.includes('oreo') || nameL.includes('hide & seek') || nameL.includes('marie gold') || nameL.includes('parle-g') || nameL.includes('good day') || nameL.includes('monaco')) {
                cat = '7';
            } else if (nameL.includes('chocolate') || nameL.includes('dairy milk') || nameL.includes('snickers') || nameL.includes('candy') || nameL.includes('kinder') || nameL.includes('gems') || nameL.includes('kitkat') || nameL.includes('munch') || nameL.includes('perk') || nameL.includes('amul dark')) {
                cat = '8';
            } else if (nameL.includes('apple') || nameL.includes('banana') || nameL.includes('orange') || nameL.includes('grapes') || nameL.includes('mango') || nameL.includes('watermelon') || nameL.includes('papaya') || nameL.includes('pomegranate') || nameL.includes('kiwi')) {
                cat = '1';
            }

            // Simple basic un-blockable robust images if they are broken
            if (!img || img === '' || img.includes('flaticon') || img.includes('gstatic') || img.includes('placeholder')) {
                if (cat === '2') img = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop';
                else if (cat === '3') img = 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?q=80&w=600&auto=format&fit=crop';
                else if (cat === '4') img = 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=600&auto=format&fit=crop';
                else if (cat === '5') img = 'https://images.unsplash.com/photo-1612929633738-8fe01f37eaf1?q=80&w=600&auto=format&fit=crop';
                else if (cat === '6') img = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop';
                else if (cat === '7') img = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=600&auto=format&fit=crop';
                else if (cat === '8') img = 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=600&auto=format&fit=crop';
                else img = 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=600&auto=format&fit=crop'; // Veg/general
            }

            // Fallbacks for things missed
            if (img.includes('default')) {
                img = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop';
            }

            if (p.category_id !== cat || p.image !== img) {
                 try {
                     await axios.put(API_URL + `/products/${p.id}`, {
                        name: p.name,
                        price: p.price,
                        original_price: p.original_price,
                        category_id: cat,
                        description: p.description,
                        stock: p.stock,
                        image: img
                     });
                     console.log(`Updated ${p.name} -> Cat: ${cat}`);
                 } catch(err) {
                    console.log(`Failed to update ${p.name} - ${err.message}`);
                 }
            }
        }
        
        console.log('Cleanup and mapping complete!');
    } catch(err) {
        console.log(err.message);
    }
}
run();
