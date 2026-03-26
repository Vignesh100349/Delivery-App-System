import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [riders, setRiders] = useState([])

  // Form State
  const [editId, setEditId] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [categoryId, setCategoryId] = useState('1')
  const [weightVal, setWeightVal] = useState('')
  const [weightUnit, setWeightUnit] = useState('gm')
  const [stock, setStock] = useState('100')
  const [image, setImage] = useState('')

  // Rider Form State
  const [riderUsername, setRiderUsername] = useState('')
  const [riderPassword, setRiderPassword] = useState('')

  const CATEGORIES = [
    { id: '1', name: 'Vegetables' },
    { id: '2', name: 'Fruits' },
    { id: '3', name: 'Dairy & Breakfast' },
    { id: '4', name: 'Breakfast' },
    { id: '5', name: 'Munchies' },
    { id: '6', name: 'Cold Drinks & Juices' },
    { id: '7', name: 'Instant & Frozen Food' },
    { id: '8', name: 'Tea, Coffee & Health Drinks' },
    { id: '9', name: 'Bakery & Biscuits' },
    { id: '10', name: 'Sweet Tooth' },
  ]

  const API_URL = 'http://localhost:5000'

  useEffect(() => {
    fetchProducts()
    fetchOrders()
    fetchRiders()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchRiders = async () => {
    try {
      const res = await fetch(`${API_URL}/riders`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setRiders(data)
      }
    } catch (error) {
      console.error('Error fetching riders:', error)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchOrders()
      } else {
        alert('Failed to update order status')
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Error connecting to backend')
    }
  }

  const handleCreateRider = async (e) => {
    e.preventDefault();
    if (!riderUsername || !riderPassword) {
      alert("Please provide both a User ID and Password");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/riders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: riderUsername, password: riderPassword }),
      });

      if (res.ok) {
        setRiderUsername('');
        setRiderPassword('');
        fetchRiders(); // Refresh rider manifest
        alert("Delivery Partner Authorized Structurally.");
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to authorize rider');
      }
    } catch (err) {
      console.error('Error creating rider:', err);
      alert('Network Error: ' + err.message);
    }
  }

  const populateForm = (product) => {
    setEditId(product.id.toString())
    setName(product.name)
    setPrice(product.price)
    setOriginalPrice(product.original_price || '')
    setCategoryId(product.category_id || '1')
    setStock(product.stock || '')
    setImage(product.image || '')

    // Parse description like "500 gm"
    if (product.description) {
      const parts = product.description.split(' ')
      if (parts.length >= 2) {
        setWeightVal(parts[0])
        setWeightUnit(parts[1])
      } else {
        setWeightVal(product.description)
        setWeightUnit('gm')
      }
    }
  }

  const handleNameChange = (val) => {
    setName(val)
    
    // Auto-fetch hook: if string perfectly patches a product in the native payload, populate the admin form!
    const existingProduct = products.find(p => p.name.toLowerCase() === val.toLowerCase())
    if (existingProduct && editId !== existingProduct.id.toString()) {
      populateForm(existingProduct)
    } else if (!existingProduct && editId) {
      // If they blank out the name perfectly, clear the form to detach edit state
      if(val.trim() === '') clearForm();
    }
  }

  const clearForm = () => {
    setEditId('')
    setName('')
    setPrice('')
    setOriginalPrice('')
    setCategoryId('1')
    setWeightVal('')
    setWeightUnit('gm')
    setStock('100')
    setImage('')
  }

  const fetchOnlineImage = () => {
    if (!name) {
      alert("Please enter a sequence name first to fetch an image!")
      return
    }
    // Generate a beautiful placeholder from Unsplash based on the product name
    const query = encodeURIComponent(name.split(' ')[0]) // Get first keyword
    setImage(`https://source.unsplash.com/400x400/?${query},grocery`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name,
      price: Number(price),
      original_price: Number(originalPrice) || 0,
      image: image || "https://placehold.co/400x400/eee/green?text=Grocery+Item",
      category_id: categoryId,
      description: `${weightVal} ${weightUnit}`,
      stock: Number(stock) || 0
    }

    try {
      const url = editId ? `${API_URL}/products/${editId}` : `${API_URL}/products`
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        clearForm()
        fetchProducts()
        alert(editId ? 'Product updated successfully!' : 'Product added successfully!')
      } else {
        const errorData = await res.json()
        alert('Operation failed: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error connecting to backend')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchProducts()
        if (editId === id.toString()) clearForm()
      } else {
        alert('Failed to delete')
      }
    } catch (err) {
      alert('Error connecting to backend')
    }
  }

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you exactly certain you want to delete this entire order and its history? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchOrders()
      } else {
        alert('Failed to delete order')
      }
    } catch (err) {
      alert('Error connecting to backend')
    }
  }

  const renderAddress = (addressString) => {
    try {
      const addressObj = JSON.parse(addressString);
      const parts = [addressObj.doorNo, addressObj.street, addressObj.area, addressObj.taluk, addressObj.district, addressObj.pincode].filter(Boolean);
      const textAddress = parts.join(', ');

      return (
        <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <strong>Address:</strong> {textAddress || "No textual address provided."}
          {addressObj.latitude && addressObj.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${addressObj.latitude},${addressObj.longitude}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', backgroundColor: '#e6f3eb',
                color: '#0c831f', padding: '4px 10px', borderRadius: '20px',
                textDecoration: 'none', fontWeight: 'bold', fontSize: '13px'
              }}
            >
              📍 Open Google Maps
            </a>
          )}
        </p>
      );
    } catch (e) {
      // Legacy strings support
      return <p><strong>Address:</strong> {addressString}</p>;
    }
  };

  return (
    <div className="admin-container">
      <header className="header">
        <h1>Nands Product Management</h1>
        <p>Manage your grocery catalog, stock, and pricing</p>
      </header>

      <main className="main-content">
        <section className="add-product-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{editId ? `Editing Product #${editId}` : 'Create New Product'}</h2>
            {editId && <button type="button" onClick={clearForm} className="cancel-btn" style={{ padding: '8px 16px', backgroundColor: '#0c831f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add New Instead</button>}
          </div>

          <form onSubmit={handleSubmit} className="product-form">

            <div className="form-group">
              <label>Product Name</label>
              <input type="text" value={name} onChange={e => handleNameChange(e.target.value)} required placeholder="e.g. Amul Taaza Toned Fresh Milk" list="product-names-list" />
              <datalist id="product-names-list">
                 {products.map(p => <option key={p.id} value={p.name} />)}
              </datalist>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sale Price (₹)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} required placeholder="e.g. 26" />
              </div>
              <div className="form-group">
                <label>Original / Discount Price (₹)</label>
                <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="e.g. 28" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Total Stock</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} required placeholder="e.g. 100" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Weight / Quantity</label>
                <input type="number" value={weightVal} onChange={e => setWeightVal(e.target.value)} required placeholder="e.g. 500" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Unit</label>
                <select value={weightUnit} onChange={e => setWeightUnit(e.target.value)}>
                  <option value="gm">gm</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="pc">pc</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Product Image URL</label>
              <div className="image-fetch-row">
                <input type="text" value={image} onChange={e => setImage(e.target.value)} placeholder="e.g. https://example.com/item.jpg" />
                <button type="button" onClick={fetchOnlineImage} className="fetch-img-btn">Fetch Online</button>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              {editId ? `Save Changes to #${editId}` : '+ Add Product to Database'}
            </button>
          </form>
        </section>

        <section className="product-list-section">
          <h2>Current Catalog ({products.length})</h2>
          <div className="product-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="card-actions">
                  <span className="card-id">ID: {product.id}</span>
                  <div>
                    <button onClick={() => populateForm(product)} className="icon-btn edit-icon">✏️</button>
                    <button onClick={() => handleDelete(product.id)} className="icon-btn del-icon">🗑️</button>
                  </div>
                </div>
                <img src={product.image || 'https://placehold.co/400x400/eee/green'} alt={product.name} className="product-image" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="price-row">
                    <span className="price">₹{product.price}</span>
                    {product.original_price > 0 && <span className="original-price">₹{product.original_price}</span>}
                  </div>
                  <p className="detail">Category: {CATEGORIES.find(c => c.id === product.category_id)?.name || product.category_id}</p>
                  <p className="detail weight">{product.description}</p>
                  <p className="detail stock">Stock: {product.stock || 0}</p>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="no-products">No products found. Add some above!</p>}
          </div>
        </section>

        <section className="orders-list-section" style={{ marginTop: '40px' }}>
          <h2>Recent Orders ({orders.length})</h2>
          <div className="orders-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {orders.map(order => (
              <div key={order.id} className="order-card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <h3>Order #{order.id}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold', color: '#d12948' }}>₹{order.total_amount}</span>
                    <button onClick={() => handleDeleteOrder(order.id)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', fontSize: '16px' }} title="Delete Order">🗑️</button>
                  </div>
                </div>
                <p>
                  <strong>Status: </strong>
                  <select
                    value={(order.status || 'PENDING').toUpperCase()}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', marginLeft: '5px' }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PREPARING">PREPARING</option>
                    <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </p>
                {renderAddress(order.address)}
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <div style={{ marginTop: '15px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Items:</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {order.items?.map(item => (
                      <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />
                        <span>{item.quantity}x {item.name} - ₹{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="no-products">No orders yet.</p>}
          </div>
        </section>

        <section className="riders-management-section" style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f1f8f3', borderRadius: '12px', border: '1px solid #cce3d4' }}>
          <h2 style={{ color: '#0c831f', marginBottom: '15px' }}>Fleet Management: Registered Riders ({riders.length})</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {riders.map(rider => (
              <div key={rider.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #0c831f', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#888' }}>Driver Database ID: #{rider.id}</p>
                <h3 style={{ margin: '0 0 5px 0', color: '#111' }}>ID: {rider.username}</h3>
                <p style={{ margin: '0', fontSize: '13px', color: '#555' }}>📞 System Auth: Active</p>
              </div>
            ))}
            {riders.length === 0 && <p style={{ color: '#555' }}>No delivery riders registered natively yet. Construct one below!</p>}
          </div>

          <form onSubmit={handleCreateRider} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: '0', marginBottom: '15px' }}>Authorize New Delivery Partner</h3>
            <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Assigned User ID</label>
                <input 
                  type="text" 
                  value={riderUsername} 
                  onChange={e => setRiderUsername(e.target.value)} 
                  required 
                  placeholder="e.g. RIDER_VIGNESH" 
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>
              <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Assigned Password</label>
                <input 
                  type="text" 
                  value={riderPassword} 
                  onChange={e => setRiderPassword(e.target.value)} 
                  required 
                  placeholder="e.g. fleet_secure123" 
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>
            </div>
            <button type="submit" style={{ backgroundColor: '#0c831f', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Construct Secure Fleet Token
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
