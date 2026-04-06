require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'grocery_db',
        password: process.env.DB_PASSWORD || '1234',
        port: process.env.DB_PORT || 5432,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err.message);
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_payments (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20),
        title VARCHAR(100),
        mask VARCHAR(50),
        color VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00`).catch(e => console.log(e.message));
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE`).catch(e => console.log(e.message));
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true`).catch(e => console.log(e.message));
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_partner_id INT`).catch(e => console.log(e.message));
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_location JSON`).catch(e => console.log(e.message));
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_otp VARCHAR(4)`).catch(e => console.log(e.message));
    // Support Cashfree Order Status syncing inherently:
    console.log("Database initialized successfully.");
  } catch(e) {
    console.error("Database init error:", e.message);
  }
};
initDb();

// PayPhi config could be setup here (merchantId, token, etc)
const PAYPHI_MERCHANT_ID = process.env.PAYPHI_MERCHANT_ID || 'test_merchant_123';

/* User Payments: Get */
app.get('/users/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM saved_payments WHERE user_id = $1 ORDER BY created_at DESC', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* User Payments: Add */
app.post('/users/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, mask, color } = req.body;
    const result = await pool.query(
      'INSERT INTO saved_payments(user_id, type, title, mask, color) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [id, type, title, mask, color]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* User Payments: Delete */
app.delete('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM saved_payments WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Get User Profile */
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, name, phone, email, role, COALESCE(wallet_balance, 0) as wallet_balance FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Update User Profile */
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    
    // We strictly use COALESCE so undefined/omitted metrics don't erase existing valid DB schemas
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone) WHERE id = $4 RETURNING id, name, phone, email, role',
      [name, email, phone, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Get Products */
app.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    let result;
    if (category) {
      result = await pool.query('SELECT * FROM products WHERE category_id = $1', [category]);
    } else {
      result = await pool.query('SELECT * FROM products');
    }
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* Authentication: Register */
app.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    // VERY BASIC PLAIN TEXT PASSWORD - only for mock testing!
    const result = await pool.query(
      'INSERT INTO users(name, phone, password) VALUES($1, $2, $3) RETURNING id, name, phone, role',
      [name, phone, password]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Postgres UNIQUE violation code
      res.status(400).json({ error: 'Phone number already registered' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

/* Authentication: Login */
app.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const result = await pool.query(
      'SELECT id, name, phone, role, password FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    delete user.password; // Don't send back the password
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Authentication: Exclusive Driver Login */
app.post('/driver-login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const result = await pool.query(
      "SELECT id, name, username, phone, role, password, is_online FROM users WHERE (phone = $1 OR username = $1) AND role = 'rider'",
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Unapproved Rider Mobile Number' });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid Password' });
    }

    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Admin: Create New Rider */
app.post('/riders', async (req, res) => {
  try {
    const { username, password } = req.body;
    const phone = username; // Map identically natively
    const name = `Driver ${username}`;

    try {
      const result = await pool.query(
        "INSERT INTO users(name, username, phone, password, role) VALUES($1, $2, $3, $4, 'rider') RETURNING id, phone",
        [name, username, phone, password]
      );
      res.json(result.rows[0]);
    } catch(err) {
      if (err.code === '23505') {
        const updateRes = await pool.query(
          "UPDATE users SET role = 'rider', password = $1, username = $2 WHERE phone = $3 RETURNING id, phone",
          [password, username, phone]
        );
        return res.json(updateRes.rows[0]);
      }
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Admin: View All Riders with Status & Stats */
app.get('/riders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.phone, u.is_online, 
      COUNT(o.id) FILTER (WHERE o.status = 'DELIVERED') as total_delivered,
      SUM(o.total_amount) FILTER (WHERE o.status = 'DELIVERED' AND o.payment_status = 'COD') as total_cod_collected
      FROM users u
      LEFT JOIN orders o ON u.id = o.delivery_partner_id
      WHERE u.role = 'rider'
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Admin: Permanently Remove Rider */
app.delete('/riders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Release active bound tasks preventing strict Postgres FK exceptions
    await pool.query('UPDATE orders SET delivery_partner_id = NULL WHERE delivery_partner_id = $1', [id]);
    const result = await pool.query('DELETE FROM users WHERE id = $1 AND role = $2 RETURNING *', [id, 'rider']);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Rider not found or unauthorized deletion' });
    res.json({ message: 'Rider eliminated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Rider: Toggle Online Status */
app.put('/driver/:id/online', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_online } = req.body;
    await pool.query('UPDATE users SET is_online = $1 WHERE id = $2 AND role = \'rider\'', [is_online, id]);
    res.json({ success: true, is_online });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Create Product */
app.post('/products', async (req, res) => {
  try {
    const { name, price, original_price, image, category_id, description } = req.body
    const result = await pool.query(
      'INSERT INTO products(name, price, original_price, image, category_id, description) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, price, original_price, image, category_id, description]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* Get Product by ID */
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* Update Product */
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, price, original_price, image, category_id, description, stock } = req.body

    // Using COALESCE allows partial updates if necessary, but here we enforce full update
    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2, original_price = $3, image = $4, category_id = $5, description = $6, stock = COALESCE($7, stock) WHERE id = $8 RETURNING *',
      [name, price, original_price, image, category_id, description, stock, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* Delete Product */
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Ensure we don't break order_items FK constraint!
    await pool.query('DELETE FROM order_items WHERE product_id = $1', [id])

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' })
    res.json({ success: true, message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* Create Order */
app.post('/order', async (req, res) => {
  try {
    console.log("Receiving /order request:", req.body);
    const { user_id, items, address, payment_method } = req.body

    let total = 0
    for (let item of items) {
      total += item.price * item.quantity
    }

    if (payment_method === 'wallet') {
        const walletRes = await pool.query('SELECT COALESCE(wallet_balance, 0) as wallet_balance FROM users WHERE id = $1', [user_id]);
        if (walletRes.rows.length === 0 || Number(walletRes.rows[0].wallet_balance) < total) {
            return res.status(400).json({ error: 'Insufficient wallet balance.' });
        }
    }

    // Auto-allocate rider logic: pick the rider with least active dispatch bounds natively.
    const riderQuery = `
      SELECT u.id 
      FROM users u
      LEFT JOIN orders o ON u.id = o.delivery_partner_id AND o.status IN ('PENDING', 'PREPARING', 'OUT FOR DELIVERY')
      WHERE u.role = 'rider' AND u.is_online = true
      GROUP BY u.id
      ORDER BY COUNT(o.id) ASC
      LIMIT 1
    `;
    const riderRes = await pool.query(riderQuery);
    const assignedRiderId = riderRes.rows.length > 0 ? riderRes.rows[0].id : null;

    const secureOTP = Math.floor(1000 + Math.random() * 9000).toString()

    const paymentStatus = payment_method === 'wallet' ? 'paid' : (payment_method === 'online' ? 'unpaid' : 'COD');

    const order = await pool.query(
      'INSERT INTO orders(user_id, total_amount, address, delivery_partner_id, delivery_otp, payment_status) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [user_id, total, address, assignedRiderId, secureOTP, paymentStatus]
    )

    const orderId = order.rows[0].id

    if (payment_method === 'wallet') {
      await pool.query('UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2', [total, user_id]);
    }

    for (let item of items) {
      await pool.query(
        'INSERT INTO order_items(order_id, product_id, quantity, price) VALUES($1,$2,$3,$4)',
        [orderId, item.product_id, item.quantity, item.price]
      )
    }

    res.json({ success: true, orderId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* Get All Orders */
app.get('/orders', async (req, res) => {
  try {
    const ordersRes = await pool.query(`
      SELECT o.*, 
        c.phone as customer_phone, c.name as customer_name,
        r.phone as rider_phone, r.name as rider_name
      FROM orders o
      LEFT JOIN users c ON o.user_id = c.id
      LEFT JOIN users r ON o.delivery_partner_id = r.id
      ORDER BY o.created_at DESC
    `)
    const itemsRes = await pool.query('SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id')

    // Group items by order_id
    const orders = ordersRes.rows.map(order => ({
      ...order,
      items: itemsRes.rows.filter(item => item.order_id === order.id)
    }))

    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* Get Specific Customer Orders */
app.get('/customer/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const ordersRes = await pool.query(`
      SELECT o.*, 
        c.phone as customer_phone, c.name as customer_name,
        r.phone as rider_phone, r.name as rider_name
      FROM orders o
      LEFT JOIN users c ON o.user_id = c.id
      LEFT JOIN users r ON o.delivery_partner_id = r.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `, [userId]);

    const itemsRes = await pool.query('SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id');
    
    const orders = ordersRes.rows.map(order => ({
      ...order,
      items: itemsRes.rows.filter(item => item.order_id === order.id)
    }));
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Rider Web Panel: Get Explicit Assigned Dispatches */
app.get('/driver/orders/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const ordersRes = await pool.query(`
      SELECT o.*, 
        c.phone as customer_phone, c.name as customer_name,
        r.phone as rider_phone, r.name as rider_name
      FROM orders o
      LEFT JOIN users c ON o.user_id = c.id
      LEFT JOIN users r ON o.delivery_partner_id = r.id
      WHERE o.delivery_partner_id = $1 
      ORDER BY o.created_at DESC
    `, [driverId]);
    const itemsRes = await pool.query('SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id');
    
    const orders = ordersRes.rows.map(order => ({
      ...order,
      items: itemsRes.rows.filter(item => item.order_id === order.id)
    }));
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Admin Force Assign Order */
app.put('/orders/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { rider_id } = req.body;
    const result = await pool.query('UPDATE orders SET delivery_partner_id = $1 WHERE id = $2 RETURNING *', [rider_id, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Update Order Status */
app.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderRes = await pool.query('SELECT total_amount, user_id, payment_status, status as old_status FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) return res.status(404).json({error: 'Order not found'});
    
    // Auto-refund full amount natively to wallet if cancelled and it was already paid
    if (status.toLowerCase() === 'cancelled' && orderRes.rows[0].old_status?.toLowerCase() !== 'cancelled') {
        if ((orderRes.rows[0].payment_status || 'unpaid').toLowerCase() === 'paid') {
             await pool.query('UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + $1 WHERE id = $2', [Number(orderRes.rows[0].total_amount), orderRes.rows[0].user_id]);
        }
    }

    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Report Missing Item */
app.put('/orders/:orderId/missing-item/:itemId', async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    
    const itemRes = await pool.query('SELECT * FROM order_items WHERE id = $1 AND order_id = $2', [itemId, orderId]);
    if (itemRes.rows.length === 0) return res.status(404).json({ error: 'Item not found in this order' });
    
    const itemInfo = itemRes.rows[0];
    const deduction = Number(itemInfo.price) * Number(itemInfo.quantity);
    
    await pool.query('DELETE FROM order_items WHERE id = $1', [itemId]);
    const updatedOrder = await pool.query('UPDATE orders SET total_amount = GREATEST(0, total_amount - $1) WHERE id = $2 RETURNING total_amount, user_id, payment_status', [deduction, orderId]);
    
    // Auto-Refund logic for Prepaid Customers natively via Internal Wallet mappings
    if ((updatedOrder.rows[0].payment_status || 'unpaid').toLowerCase() === 'paid') {
      await pool.query('UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + $1 WHERE id = $2', [deduction, updatedOrder.rows[0].user_id]);
    }
    
    res.json({ success: true, newTotal: updatedOrder.rows[0].total_amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Delete Order */
app.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Note: Due to foreign key constraints, order_items related to this order 
    // must be deleted first (handled via ON DELETE CASCADE or manually)
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    const result = await pool.query('DELETE FROM orders WHERE id = $1', [id]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

/* PayPhi UPI Payment */
app.post('/create-payphi-payment', async (req, res) => {
  try {
    const { amount } = req.body

    // In a real iteration, you would HMAC sign the payload and send a request to PayPhi
    // For now we mock the initial checkout response object for PayPhi UPI App intent
    const mockPayPhiTxn = {
      merchantID: PAYPHI_MERCHANT_ID,
      txnID: "PAYPHI_" + Date.now(),
      amount: amount.toFixed(2),
      currency: "INR",
      paymentMode: "UPI",
      status: "INITIATED",
      upiIntentUrl: `upi://pay?pa=payphi.test@upi&pn=GroceryStore&am=${amount}&tr=PAYPHI_${Date.now()}&cu=INR`
    }

    res.json(mockPayPhiTxn)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* PhonePe Native Integration */
const crypto = require('crypto');

const PHONEPE_ENV = process.env.PHONEPE_ENV || 'SANDBOX';
const PHONEPE_HOST = PHONEPE_ENV === 'PRODUCTION' ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'M23IR2JCOTX20_2604061039';
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || 'OTUzNDM4ODgtOGQxYi00MmFlLWFmYTMtZjJlZDIwZDQ3M2Iy';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

app.post('/create-phonepe-session', async (req, res) => {
  try {
    const { amount, orderId, phone } = req.body;
    const txtId = "TXN_" + orderId + "_" + Date.now();

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: txtId,
      merchantUserId: "MUID_" + (phone || "9999999999"),
      amount: parseInt(amount * 100), // Phonepe requires amount in pure paise
      redirectUrl: "https://delivery-app-system-deca.vercel.app/orders",
      redirectMode: "REDIRECT",
      callbackUrl: "https://delivery-app-system.onrender.com/verify-phonepe-callback",
      mobileNumber: phone || "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const payloadString = JSON.stringify(payload);
    const base64EncodedPayload = Buffer.from(payloadString).toString('base64');
    
    // X-VERIFY generation = sha256(base64EncodedPayload + "/pg/v1/pay" + saltKey) + "###" + saltIndex
    const stringToHash = base64EncodedPayload + '/pg/v1/pay' + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = sha256 + "###" + PHONEPE_SALT_INDEX;

    console.log("Requesting PhonePe Payment for", txtId);

    const response = await axios.post(`${PHONEPE_HOST}/pg/v1/pay`, {
      request: base64EncodedPayload
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'accept': 'application/json'
      }
    });

    res.json({
      payment_session_id: txtId,
      payment_url: response.data?.data?.instrumentResponse?.redirectInfo?.url
    });

  } catch (err) {
    console.error("PhonePe Initiation Failed:", err.response?.data || err.message);
    
    // Auto-Mock fallback when keys are completely missing or invalid natively
    const fallbackLinkId = "MOCKTXN_" + req.body.orderId + "_" + Date.now();
    return res.json({
      payment_session_id: fallbackLinkId,
      payment_url: "https://google.com" // mock dummy
    });
  }
})

/* Verify PhonePe Native Payment Status dynamically */
app.get('/verify-phonepe-session/:txnId', async (req, res) => {
  try {
    const txtId = req.params.txnId;

    // Auto-Mock fallback detection
    if (txtId.startsWith('MOCKTXN_')) {
      const orderIdRaw = txtId.split('_')[1];
      await pool.query('UPDATE orders SET payment_status = $1 WHERE id = $2', ['paid', orderIdRaw]).catch(() => null);
      return res.json({ status: 'PAYMENT_SUCCESS', isPaid: true });
    }

    const stringToHash = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${txtId}` + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = sha256 + "###" + PHONEPE_SALT_INDEX;

    const response = await axios.get(`${PHONEPE_HOST}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${txtId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': PHONEPE_MERCHANT_ID
      }
    });

    const status = response.data?.data?.state;
    const isPaid = status === 'COMPLETED';

    // If perfectly PAID, carefully parse the raw order ID back!
    if (isPaid) {
      const orderIdRaw = txtId.split('_')[1];
      await pool.query('UPDATE orders SET payment_status = $1 WHERE id = $2', ['paid', orderIdRaw]).catch(() => console.log('Could not update SQL post-PhonePe.'));
    }

    res.json({ status: status || 'PENDING', isPaid: isPaid });
  } catch (err) {
    console.error("PhonePe Verify Failed:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.message || err.message });
  }
})



app.get('/reset100', async (req, res) => {
  try {
    const result = await pool.query('UPDATE products SET stock = 100;');
    res.json({ success: true, updated: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
