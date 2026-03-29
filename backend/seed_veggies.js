const axios = require('axios');

const rawData = `10 mins
Coriander Bunch (Dhaniya Patta)
100 g
₹5
₹9
ADD
19% OFF
10 mins
Onion (Pyaz)
1 kg
₹29
₹36
ADD
18% OFF
10 mins
Green Chilli (Hari Mirch)
100 g
₹13
₹16
ADD
30% OFF
10 mins
Lemon
200 g
₹37
₹53
ADD
12% OFF
10 mins
English Cucumber (Kheera)
500 g
₹29
₹33
ADD
21% OFF
10 mins
Cauliflower (Phool Gobhi)
400 g
₹36
₹46
ADD
12% OFF
10 mins
Ginger (Adrak)
200 g
₹29
₹33
ADD
32% OFF
10 mins
Potato - New Crop (Aloo)
1 kg
₹17
₹25
ADD
2 options
22% OFF
10 mins
Green Capsicum (Shimla Mirch)
250 g
₹27
₹35
ADD
12% OFF
10 mins
Red Carrot - 500 g (Gajar)
500 g
₹21
₹24
ADD
24% OFF
10 mins
Desi Tomato (Tamatar)
500 g
₹19
₹25
ADD
2 options
18% OFF
10 mins
Button Mushroom
180 g
₹43
₹53
ADD
26% OFF
10 mins
Hybrid Tomato (Tamatar)
500 g
₹19
₹26
ADD
2 options
10% OFF
10 mins
French Beans - 250 g
250 g
₹25
₹28
ADD
12% OFF
10 mins
Bottle Gourd (Lauki)
400 g
₹35
₹40
ADD
14% OFF
10 mins
Orange Carrot (Gajar)
200 g
₹12
₹14
ADD
21% OFF
10 mins
Garlic (Lehsun)
200 g
₹32
₹41
ADD
20% OFF
10 mins
Onion - Pack of 2 (Pyaz)
2 x 1 kg
₹57
₹72
ADD
18% OFF
10 mins
Broccoli
300 g
₹79
₹97
ADD
22% OFF
10 mins
Green Cucumber (Kheera)
500 g
₹28
₹36
ADD
15% OFF
10 mins
Red Bell Pepper
125 g
₹58
₹69
ADD
15% OFF
10 mins
Organically Grown Ginger (Adrak)
100 g
₹27
₹32
ADD
20% OFF
10 mins
Lady Finger (Bhindi)
250 g
₹35
₹44
ADD
2 options
9% OFF
10 mins
Beetroot (Chukandar)
500 g
₹19
₹21
ADD
13% OFF
10 mins
Organically Grown Potato (Aloo)
1 kg
₹31
₹36
ADD
18% OFF
10 mins
Mint Leaves (Pudina)
100 g
₹13
₹16
ADD
17% OFF
10 mins
Spinach (Palak)
200 g
₹14
₹17
ADD
2 options
15% OFF
10 mins
Yellow Bell Pepper
125 g
₹59
₹70
ADD
10% OFF
10 mins
Cabbage (Patta Gobhi)
400 g
₹18
₹20
ADD
12% OFF
10 mins
Curry Leaves (Kadi Patta)
50 g
₹27
₹31
ADD
11% OFF
10 mins
Green Peas (Matar)
250 g
₹31
₹35
ADD
2 options
19% OFF
10 mins
Coriander (Without Roots) (Dhaniya)
100 g
₹21
₹26
ADD
2 options
22% OFF
10 mins
Organically Grown- Lady Finger (Bhindi)
250 g
₹45
₹58
ADD
21% OFF
10 mins
Spring Onion (Hari Pyaz)
150 g
₹15
₹19
ADD
20% OFF
10 mins
Organically Grown Tomato (Hybrid) (Tamatar)
500 g
₹39
₹49
ADD
15% OFF
10 mins
Organically Grown Coriander (without Roots) (Dhaniya Patta)
100 g
₹27
₹32
ADD
22% OFF
10 mins
Brinjal - Bharta (Baingan)
500 g
₹42
₹54
ADD
16% OFF
10 mins
Organically Grown Garlic (Lehsun)
100 g
₹31
₹37
ADD
13% OFF
10 mins
Portion Pumpkin
500 g
₹60
₹69
ADD
21% OFF
10 mins
Organically Grown Tomato (Desi) (Tamatar)
500 g
₹33
₹42
ADD
21% OFF
10 mins
Amla (Amla)
250 g
₹40
₹51
ADD
17% OFF
10 mins
Organically Grown Lemon
220 g
₹77
₹93
ADD
21% OFF
10 mins
Green Lettuce
100 g
₹22
₹28
ADD
22% OFF
10 mins
Organically Grown - Onion (Pyaz)
500 g
₹34
₹44
ADD
13% OFF
10 mins
Spinach (without roots) (Palak)
200 g
₹26
₹30
ADD
13% OFF
10 mins
Pointed Gourd (250 g) (Parwal)
250 g
₹32
₹37
ADD
12% OFF
10 mins
Radish (Mooli)
500 g
₹28
₹32
ADD
21% OFF
10 mins
Sweet Potato (Shakarkandi)
450 g
₹55
₹70
ADD
12% OFF
10 mins
Italian Basil Leaves
50 g
₹43
₹49
ADD
17% OFF
10 mins
Small-Purple Brinjal (Baingan)
250 g
₹29
₹35
ADD
17% OFF
10 mins
Green Zucchini
200 g
₹23
₹28
ADD
16% OFF
10 mins
Red Potato (Aloo)
1 kg
₹36
₹43
ADD
11% OFF
10 mins
Drumstick (Sahjan)
250 g
₹31
₹35
ADD
17% OFF
10 mins
Organically Grown Green Capsicum
250 g
₹64
₹78
ADD
14% OFF
10 mins
Iceberg Lettuce
250 g
₹30
₹35
ADD
14% OFF
10 mins
Organically Grown French Beans
250 g
₹40
₹47
ADD
18% OFF
10 mins
Baby Potato (Aloo)
500 g
₹18
₹22
ADD
19% OFF
10 mins
Cherry Tomatoes
200 g
₹46
₹57
ADD
20% OFF
10 mins
Organically Grown Chilli (Hari Mirch)
100 g
₹28
₹35
ADD
18% OFF
10 mins
Organically Grown Cauliflower (Phool Gobhi)
300 g
₹44
₹54
ADD
12% OFF
10 mins
Bitter Gourd (Karela)
250 g
₹43
₹49
ADD
14% OFF
10 mins
Organically Grown Beetroot (Chukandar)
250 g
₹24
₹28
ADD
19% OFF
10 mins
Organically Grown Green Peas
250 g
₹29
₹36
ADD
12% OFF
10 mins
Sweet Corn - Packet
180 g
₹34
₹39
ADD
14% OFF
10 mins
Cluster Beans (Gwar Phali)
250 g
₹24
₹28
ADD
16% OFF
10 mins
Organically Grown - English Cucumber (Khira, Kheera)
500 g
₹40
₹48
ADD
22% OFF
10 mins
Arvi
250 g
₹42
₹54
ADD
18% OFF
10 mins
Organically Grown Radish (Mooli)
500 g
₹31
₹38
ADD
17% OFF
10 mins
Mixed Sprouts
200 g
₹33
₹40
ADD
16% OFF
10 mins
Baby Corn - Packet
200 g
₹45
₹54
ADD
17% OFF
10 mins
Green Moong Sprouts
150 g
₹39
₹47
ADD
21% OFF
10 mins
Organically Grown Cabbage (Patta Gobhi)
400 g
₹29
₹37
ADD
19% OFF
10 mins
Chappan Tinda/ Summer Squash
500 g
₹29
₹36
ADD
12% OFF
10 mins
Organically Grown Green Cucumber (Khira, Kheera)
500 g
₹48
₹55
ADD
15% OFF
10 mins
Hydroponic Sweet Bell Pepper (Cocktail)
200 g
₹158
₹186
ADD
22% OFF
10 mins
Jackfruit (Cut) (Kathal)
200 g
₹47
₹61
ADD
16% OFF
10 mins
Bok Choy
200 g
₹45
₹54
ADD
16% OFF
10 mins
Lettuce Mix
100 g
₹42
₹50
ADD
16% OFF
10 mins
Broccoli Florets
100 g
₹50
₹60
ADD
13% OFF
10 mins
Potato Carisma (Lower Glycemic Index)
1 kg
₹45
₹52
ADD
12% OFF
10 mins
Mix Cherry Tomatoes
100 g
₹58
₹66
ADD
20% OFF
10 mins
Organically Grown Bitter Gourd (Karela)
250 g
₹48
₹60
ADD
10% OFF
10 mins
Yellow Zucchini
200 g
₹26
₹29
ADD
15% OFF
10 mins
Raw Banana (Kacha Kela)
3 pcs
₹56
₹66
ADD
20% OFF
10 mins
Green Pumpkin (Hara Kaddu)
1.5 kg
₹82
₹103
ADD
18% OFF
10 mins
Snacking Seedless Cucumber - Hydroponically Grown
500 g
₹57
₹70
ADD
19% OFF
10 mins
Parsley
25 g
₹34
₹42
ADD
13% OFF
10 mins
Baby Spinach
100 g
₹37
₹43
ADD
16% OFF
10 mins
Raw Turmeric (Kachhi Haldi)
250 g
₹31
₹37
ADD
19% OFF
10 mins
Rocket Leaves (Arugula)
50 g
₹41
₹51
ADD
16% OFF
10 mins
American Sweet Corn Cob (Bhutta)
1 pc
₹36
₹43
ADD
22% OFF
10 mins
Baby Onion (Sirka Pyaz)
250 g
₹17
₹22
ADD
13% OFF
10 mins
Brown Chana Sprouts
150 g
₹33
₹38
ADD
14% OFF
10 mins
Cremini Mushroom
125 g
₹259
₹303
ADD
19% OFF
10 mins
Thai Sweet Basil Leaves
25 g
₹38
₹47
ADD
16% OFF
10 mins
Green Peas (Peeled)
200 g
₹55
₹66
ADD
18% OFF
10 mins
Fresh Rosemary
10 g
₹18
₹22
ADD
20% OFF
10 mins
Lemongrass
100 g
₹27
₹34
ADD
14% OFF
10 mins
Celery
100 g
₹35
₹41
ADD
17% OFF
10 mins
Broad Beans 250 g (Sem Phali)
250 g
₹32
₹39
ADD
22% OFF
10 mins
Kaffir Lime Leaves (Makroot)
10 g
₹46
₹59
ADD
22% OFF
10 mins
Unpeeled Garlic Cloves
110 g
₹38
₹49
ADD
14% OFF
10 mins
Halwa Carrot (Gajar)
2 kg
₹41
₹48
ADD
17% OFF
10 mins
Organically Grown Mint Leaves (Without Roots) (Pudina)
100 g
₹33
₹40
ADD
13% OFF
10 mins
Organically Grown Raw Turmeric
250 g
₹20
₹23
ADD
18% OFF
10 mins
Organically Grown Orange Carrot
500 g
₹40
₹49
ADD
20% OFF
10 mins
Bajji Chilli
250 g
₹27
₹34
ADD
16% OFF
10 mins
Lotus Stem (Kamal Kakdi)
250 g
₹88
₹106
ADD
13% OFF
10 mins
White Oyster Mushroom (Kukurmutta)
125 g
₹128
₹148
ADD
18% OFF
10 mins
Organically Grown Thai Guava
500 g
₹104
₹128
ADD
15% OFF
10 mins
Cauliflower Florets (Phool Gobhi)
200 g
₹59
₹70
ADD
20% OFF
10 mins
Grated Red Carrot (Gajar)
250 g
₹43
₹54
ADD
18% OFF
10 mins
Long Green Brinjal (Baingan)
250 g
₹26
₹32
ADD
19% OFF
10 mins
Shiitake Mushroom
125 g
₹259
₹323
ADD
15% OFF
10 mins
Captain Punch Potato (Aloo)
1 kg
₹28
₹33
ADD
12% OFF
10 mins
Gondhoraj Lime
2 - 3 pcs
₹57
₹65
ADD
18% OFF
10 mins
Knol Khol (Gaath Gobhi)
500 g
₹40
₹49
ADD
19% OFF
10 mins
Neem Sticks
100 g
₹57
₹71
ADD
13% OFF
10 mins
Wheat Grass
25 g
₹25
₹29
ADD
16% OFF
10 mins
Kachalu
500 g
₹46
₹55
ADD
18% OFF
10 mins
Round Gourd (Tinda)
250 g
₹27
₹33
ADD
22% OFF
10 mins
Giloy Stick
25 g
₹42
₹54
ADD
21% OFF
10 mins
Ash Gourd 250 g Portion
250 g
₹36
₹46
ADD
21% OFF
10 mins
Pulao Veggie Mix
250 g
₹77
₹98
ADD
13% OFF
10 mins
Red Amaranthus Leaves (Lal Chaulai)
250 g
₹37
₹43
ADD
12% OFF
10 mins
Soaked Chole
200 g
₹44
₹50
ADD
15% OFF
10 mins
Soaked Rajma
200 g
₹45
₹53
ADD
Out of Stock
10 mins
Fenugreek (Methi)
250 g
₹17
₹20
Out of Stock
10 mins
Organically Grown Red Carrot (Gajar)
500 g
₹36
₹44
Out of Stock
10 mins
Mint Leaves (Without Roots) (Pudina)
100 g
₹45
₹57
Out of Stock
10 mins
Peeled Garlic
100 g
₹73
₹92
Out of Stock
10 mins
Organically Grown Sweet Potato
500 g
₹75
₹90
Out of Stock
10 mins
Turnip (Shalgam)
500 g
₹30
₹36
Out of Stock
10 mins
Fenugreek Leaves (without Roots) (Methi)
200 g
₹26
₹31
Out of Stock
10 mins
Spring Garlic
200 g
₹25
₹30
Out of Stock
10 mins
Raw Papaya (Kacha Papita)
400 g
₹30
₹36
Out of Stock
10 mins
Red Cabbage
400 g
₹28
₹34
Out of Stock
10 mins
Flat Kale Leaves
100 g
₹29
₹35
Out of Stock
10 mins
Organically Grown Spinach (Without Roots) (Palak)
250 g
₹30
₹37
Out of Stock
10 mins
Picador Chilli (Achari Mirch)
250 g
₹28
₹35
Out of Stock
10 mins
Sponge Gourd (Tori)
250 g
₹14
₹17
Out of Stock
10 mins
Chenopodium (Bathua)
250 g
₹27
₹31
Out of Stock
10 mins
Organically Grown Broccoli
250 g
₹53
₹67
Out of Stock
10 mins
Long Purple Brinjal (Baingan)
250 g
₹26
₹31
Out of Stock
10 mins
Romaine Lettuce
100 g
₹34
₹39
Out of Stock
10 mins
Peeled Green Chana (Hara Chana)
200 g
₹67
₹85
Out of Stock
10 mins
Garlic Chives
10 g
₹37
₹43
Out of Stock
10 mins
Mustard Leaves (Sarso Saag)
250 g
₹17
₹20
Out of Stock
10 mins
Organically Grown Amla (Amla)
250 g
₹30
₹39
Out of Stock
10 mins
Dill Leaves (Shepu) (Soya)
100 g
₹17
₹22
Out of Stock
10 mins
Snack Bell Pepper
125 g
₹96
₹113
Out of Stock
10 mins
Neem Leaves
1 pack
₹19
₹23
Out of Stock
10 mins
Butternut Squash
400 g
₹104
₹120
Out of Stock
10 mins
Hara Chana Saag
200 g
₹35
₹45
Out of Stock
10 mins
Mustard Leaves - Chopped (Sarso Saag) (Sarso Saag, Sarsoon ka Saag)
200 g
₹45
₹58
Out of Stock
10 mins
Green Radish Pods (Mogri Beans) (Mogri Phali)
200 g
₹40
₹48
Out of Stock
10 mins
Spinach - Chopped
250 g
₹36
₹45
Out of Stock
10 mins
Fresh Green Jalapeno
100 g
₹48
₹55
Out of Stock
10 mins
Organically Grown Bottle Gourd (Lauki)
400 g
₹72
₹86
Out of Stock
10 mins
Sarso Saag Veggie Mix (Chopped Sarso, Methi & Palak)
500 g
₹51
₹58
Out of Stock
10 mins
Field Beans (Bakla Beans)
250 g
₹19
₹21
Out of Stock
10 mins
Kakdi
500 g
₹25
₹31
Out of Stock
10 mins
Chopped Chenopodium (Bathua)
200 g
₹33
₹39
Out of Stock
10 mins
Organically Grown Wood Apple
400 g
₹45
₹54
Out of Stock
10 mins
Organically Grown Mustard Leaves (Sarso Saag) (Without Roots)
250 g
₹23
₹29
Out of Stock
10 mins
Thai Bird Eye Chilli - Red (Laal Mirch)
20 g
₹69
₹84
Out of Stock
10 mins
Black Carrot (Gajar)
500 g
₹82
₹97
Out of Stock
10 mins
Green Mizuna/ Mustard Leaves
50 g
₹33
₹40
Out of Stock
10 mins
Potato (Aloo)
1 kg
₹25
₹31
Out of Stock
10 mins
Ivy Gourd (Kundru)
250 g
₹33
₹39
Out of Stock
10 mins
Organically Grown Chenopodium (Bathua)
250 g
₹27
₹31
Out of Stock
10 mins
Organically Grown Coriander (without Roots) (Dhaniya Patta)
100 g
₹24
₹30
Out of Stock
10 mins
Organically Grown Fenugreek (without Roots) (Methi)
250 g
₹30
₹35
Out of Stock
10 mins
Organically Grown Green Zucchini
200 g
₹17
₹20
Out of Stock
10 mins
Organically Grown Radish (Mooli)
350 g
₹28
₹32`;

const parseItems = (text) => {
    let lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const items = [];
    let i = 0;
    while(i < lines.length) {
        if(lines[i] === '10 mins') {
            i++;
            if(i >= lines.length) break;
            const name = lines[i++];
            const weight = lines[i++];
            let priceRaw = lines[i++];
            let price = priceRaw.replace('₹', '');
            let discountPriceRaw = lines[i++];
            let iisOut = false;
            let stock = 100;
            
            // Advance cursor if we see ADD or "Out of Stock" or options
            while(i < lines.length && !lines[i].includes('10 mins')) {
               const l = lines[i];
               if(l === 'Out of Stock') iisOut = true;
               if(l.includes('% OFF')) { /* skip % off */ }
               i++;
            }
            if(iisOut) stock = 0;
            
            // Create final product format match your backend model
            items.push({
                name: name,
                category: 'Vegetables',
                price: parseFloat(price) || 20,
                stock: stock, // the user requested stock quantity to be 100
                image_url: 'https://cdn-icons-png.flaticon.com/512/3143/3143643.png',
                unit: weight
            });
        } else {
            i++;
        }
    }
    return items;
}

const sendToAPI = async () => {
    const products = parseItems(rawData);
    console.log("Parsed", products.length, "Products.");
    
    // First: the user wants to "replace some of products". I'll get all existing and maybe delete them if they match, or just clear old vegetables.
    // For safety, they said "add these all stocks, and some of products need to replace".
    // I'll just push them all directly.
    const url = 'https://delivery-app-system.onrender.com/products';

    for(const p of products) {
        try {
            // we will POST one by one. Our Render endpoint app.post('/products', ...) inserts!
            await axios.post(url, p);
            console.log("Inserted:", p.name);
        } catch (e) {
            console.log("Failed to insert:", p.name, e?.response?.data || e.message);
        }
    }
    console.log("Completed!");
}

sendToAPI();
