require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'grocery_db',
  password: process.env.DB_PASSWORD || 'yourpassword',
  port: process.env.DB_PORT || 5432,
})

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
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00`);
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
    const { user_id, items, address } = req.body

    let total = 0
    for (let item of items) {
      total += item.price * item.quantity
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

    const order = await pool.query(
      'INSERT INTO orders(user_id, total_amount, address, delivery_partner_id, delivery_otp) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [user_id, total, address, assignedRiderId, secureOTP]
    )

    const orderId = order.rows[0].id

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

/* Cashfree Native Integration */
const CF_ENV = process.env.CASHFREE_ENV || 'SANDBOX';
const CF_BASE_URL = CF_ENV === 'PRODUCTION' ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';
const CF_CLIENT_ID = process.env.CASHFREE_CLIENT_ID || '';
const CF_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET || '';

app.post('/create-cashfree-session', async (req, res) => {
  try {
    console.log("Receiving /create-cashfree-session request:", req.body);
    const { amount, orderId, phone } = req.body;
    const cfLinkId = "LINK_" + orderId + "_" + Date.now();

    const response = await axios.post(`${CF_BASE_URL}/pg/links`, {
      link_amount: amount,
      link_currency: "INR",
      link_id: cfLinkId,
      link_purpose: "Grocery Order " + orderId,
      customer_details: {
        customer_phone: phone || "9999999999",
        customer_name: "Test User"
      },
      link_notify: {
        send_sms: false,
        send_email: false
      }
    }, {
      headers: {
        'x-client-id': CF_CLIENT_ID,
        'x-client-secret': CF_CLIENT_SECRET,
        'x-api-version': '2023-08-01',
        'content-type': 'application/json',
        'accept': 'application/json'
      }
    });

    res.json({
      payment_session_id: response.data.link_id,
      payment_url: response.data.link_url
    });
  } catch (err) {
    console.error("Cashfree Failed:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.message || err.message })
  }
})

/* Verify Cashfree Native Payment */
app.get('/verify-cashfree-session/:linkId', async (req, res) => {
  try {
    console.log(`Verifying payment for link_id: ${req.params.linkId}`);
    const response = await axios.get(`${CF_BASE_URL}/pg/links/${req.params.linkId}`, {
      headers: {
        'x-client-id': CF_CLIENT_ID,
        'x-client-secret': CF_CLIENT_SECRET,
        'x-api-version': '2023-08-01',
        'accept': 'application/json'
      }
    });

    const isPaid = response.data.link_status === 'PAID';

    // If PAID, safely update the local DB
    if (isPaid) {
      const orderIdRaw = response.data.link_purpose.replace('Grocery Order ', '').trim();
      await pool.query('UPDATE orders SET payment_status = $1 WHERE id = $2', ['paid', orderIdRaw]).catch(() => console.log('Could not auto-update order status SQL.'));
    }

    res.json({ status: response.data.link_status, isPaid: isPaid });
  } catch (err) {
    console.error("Cashfree Verify Failed:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.message || err.message });
  }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
