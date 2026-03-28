import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Truck, LogOut, FileText, CheckCircle, Smartphone } from 'lucide-react';
import './App.css';

const API_URL = 'https://delivery-app-system.onrender.com';

export default function App() {
  const [riders, setRiders] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [riderOrders, setRiderOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('fleet');
  const [deliveredOrders, setDeliveredOrders] = useState([]);

  const parseSafeJSON = (data) => {
    if (!data) return {};
    if (typeof data === 'object') return data;
    try { return JSON.parse(data); }
    catch { return { street: data }; }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      const res = await axios.get(`${API_URL}/riders`);
      setRiders(res.data);
      const ordersRes = await axios.get(`${API_URL}/orders`);
      if (Array.isArray(ordersRes.data)) {
        setAllOrders(ordersRes.data.filter(o => ['pending', 'preparing', 'out for delivery'].includes((o.status || '').toLowerCase())));
        setDeliveredOrders(ordersRes.data.filter(o => (o.status || '').toLowerCase() === 'delivered'));
      }
    } catch(err) { console.error(err); }
  };

  const handleCreateRider = async (e) => {
    e.preventDefault();
    if(newPhone.length < 10) return alert('Enter a valid 10-digit mobile number');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/riders`, { username: newPhone, password: 'Loopie$123' });
      setNewPhone('');
      setNewName('');
      fetchRiders();
      alert('Rider Created! Default Password is: Loopie$123');
    } catch(err) {
      alert(err.response?.data?.error || 'Failed to create rider');
    } finally { setLoading(false); }
  };

  const forceDisconnect = async (riderId) => {
    if(!window.confirm("Disconnect this driver? They will stop receiving auto-allocated orders.")) return;
    try {
      await axios.put(`${API_URL}/driver/${riderId}/online`, { is_online: false });
      fetchRiders();
    } catch(err) { alert('Failed'); }
  };

  const removeRider = async (riderId, riderName) => {
    if(!window.confirm(`PERMANENTLY DELETE Driver ${riderName}? This action cannot be reversed.`)) return;
    try {
      await axios.delete(`${API_URL}/riders/${riderId}`);
      fetchRiders();
    } catch(err) { alert(err.response?.data?.error || 'Failed to delete rider'); }
  };

  const handleAssignOrder = async (orderId, targetRiderId) => {
    if (!targetRiderId) return;
    try {
      await axios.put(`${API_URL}/orders/${orderId}/assign`, { rider_id: targetRiderId });
      fetchRiders();
    } catch(err) {
      alert('Failed to re-assign order');
    }
  };

  const viewRiderManifest = async (rider) => {
    setSelectedRider(rider);
    try {
      const res = await axios.get(`${API_URL}/driver/orders/${rider.id}`);
      setRiderOrders(res.data);
    } catch(err) { console.error(err); }
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Truck size={24} color="#22c55e" />
          <h2>Rider Admin Panel</h2>
        </div>
        <div className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => { setActiveTab('fleet'); setSelectedRider(null); }}>
            <Users size={18} /> Fleet Management
          </div>
          <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => { setActiveTab('reports'); setSelectedRider(null); }}>
            <FileText size={18} /> Delivery Reports
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="top-bar">
          <h1>{activeTab === 'fleet' ? 'Fleet Control Center' : 'Historical Delivery Reports'}</h1>
          <button className="refresh-btn" onClick={fetchRiders}>⟳ Sync Data</button>
        </div>

        {activeTab === 'reports' && !selectedRider && (
          <div>
            <div className="report-summary" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div className="creation-card" style={{ flex: 1, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <h3 style={{ color: '#16a34a' }}>Total Delivered</h3>
                <h1 style={{ fontSize: '3rem', margin: '10px 0', color: '#15803d' }}>{deliveredOrders.length}</h1>
              </div>
              <div className="creation-card" style={{ flex: 1, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <h3 style={{ color: '#2563eb' }}>Gross Value Completed</h3>
                <h1 style={{ fontSize: '3rem', margin: '10px 0', color: '#1d4ed8' }}>
                  ₹{deliveredOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)}
                </h1>
              </div>
            </div>

            <h3 className="section-title">Completed Operations Roster ({deliveredOrders.length})</h3>
            <div className="table-container">
              <table className="fleet-table">
                <thead>
                  <tr>
                    <th>Completion ID</th>
                    <th>Rider Assigned</th>
                    <th>Payment Route</th>
                    <th>Gross Value</th>
                    <th>Final Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredOrders.map(o => (
                    <tr key={o.id}>
                      <td style={{fontWeight:'bold'}}>#{o.id} <br/><span style={{fontSize:'12px',color:'#64748b'}}>{new Date(o.created_at || Date.now()).toLocaleDateString()}</span></td>
                      <td>{o.rider_name || o.delivery_partner_id ? `ID #${o.delivery_partner_id}` : 'N/A'}</td>
                      <td><span className={`tag ${o.payment_status?.toLowerCase() === 'paid' ? 'online' : 'offline'}`}>{o.payment_status?.toUpperCase() || 'UNPAID'}</span></td>
                      <td style={{fontWeight:'bold'}}>₹{o.total_amount}</td>
                      <td><CheckCircle size={18} color="#16a34a" style={{verticalAlign: -4, marginRight: 5}}/>{o.status}</td>
                    </tr>
                  ))}
                  {deliveredOrders.length === 0 && (
                    <tr><td colSpan="5" style={{textAlign:'center', padding:30}}>No deliveries have been completed natively yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'fleet' && selectedRider ? (
          <div>
            <button className="back-btn" onClick={() => setSelectedRider(null)}>← Back to Fleet</button>
            <h3 className="section-title">Current Manifest: Driver {selectedRider.phone}</h3>
            <div className="orders-grid">
               {riderOrders.map(o => {
                  const addr = parseSafeJSON(o.address);
                  return (
                    <div key={o.id} className="order-card">
                      <div className="order-header">
                        <h3>Order #{o.id}</h3>
                        <span className="status-badge">{o.status}</span>
                      </div>
                      <p><strong>Customer:</strong> {addr.street}, {addr.area}</p>
                      <p><strong>Type:</strong> {o.payment_status}</p>
                      <p><strong>Total:</strong> ₹{o.total_amount}</p>
                      <div className="items-box">
                        <strong>Cargo Layout</strong>
                        <ul className="items-list">
                          {(typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items || []).map((itm, i) => (
                            <li key={i}>{itm.quantity}x {itm.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
               })}
                {riderOrders.length === 0 && <p>This rider has no assigned orders.</p>}
            </div>
          </div>
        ) : activeTab === 'fleet' && !selectedRider ? (
          <>
            {/* Create Rider Form */}
            <div className="creation-card">
              <h3>Authorize New Rider</h3>
              <p>Mobile number serves as the Secure Login ID. Passwords default to <strong>Loopie$123</strong>.</p>
              <form onSubmit={handleCreateRider} className="auth-form">
                <input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="👤 Rider's Full Name" 
                  style={{flex: 0.8}}
                />
                <input 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  placeholder="📱 10-Digit Mobile ID" 
                  maxLength={10}
                  keyboardType="numeric"
                  style={{flex: 1}}
                />
                <button type="submit" disabled={loading}>+ Grant Terminal Access</button>
              </form>
            </div>

            {/* Rider List Table */}
            <h3 className="section-title">Active Fleet Roster ({riders.length})</h3>
            <div className="table-container">
              <table className="fleet-table">
                <thead>
                  <tr>
                    <th>Rider Mobile / ID</th>
                    <th>Status</th>
                    <th>Completed Runs</th>
                    <th>Total COD Secured</th>
                    <th>Manifest / Tools</th>
                  </tr>
                </thead>
                <tbody>
                  {riders.map(rider => (
                    <tr key={rider.id}>
                      <td style={{fontWeight:'bold'}}>
                        ID: #{rider.id} <br/>
                        <span style={{color:'#64748b', fontSize: '12px'}}>{rider.name}</span><br/>
                        <Smartphone size={14} style={{verticalAlign:-2, marginRight:5}} />
                        {rider.phone || rider.username}
                      </td>
                      <td>
                        {rider.is_online ? <span className="tag online">● ONLINE</span> : <span className="tag offline">○ OFFLINE</span>}
                      </td>
                      <td>{rider.total_delivered || 0}</td>
                      <td style={{color: '#d12948', fontWeight:'bold'}}>₹{rider.total_cod_collected || 0}</td>
                      <td>
                        <button className="action-btn view" onClick={() => viewRiderManifest(rider)}>View Orders</button>
                        {rider.is_online && (
                          <button className="action-btn force" style={{marginRight: 8}} onClick={() => forceDisconnect(rider.id)}>Force Offline</button>
                        )}
                        <button className="action-btn force" style={{backgroundColor: '#64748b', color: '#fff'}} onClick={() => removeRider(rider.id, rider.name || rider.phone)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {riders.length === 0 && (
                    <tr><td colSpan="5" style={{textAlign:'center', padding:30}}>No riders registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <h3 className="section-title" style={{marginTop: 40}}>Global Dispatch Queue ({allOrders.length})</h3>
            <div className="table-container">
              <table className="fleet-table">
                <thead>
                  <tr>
                    <th>Dispatch ID</th>
                    <th>Customer Location</th>
                    <th>Status</th>
                    <th>Current Status Log</th>
                    <th>Assign Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map(o => {
                    const addr = parseSafeJSON(o.address);
                    return (
                      <tr key={o.id}>
                        <td style={{fontWeight:'bold'}}>#{o.id}</td>
                        <td>{addr.street || 'Map'}, {addr.area}</td>
                        <td><span className="status-badge">{o.status}</span></td>
                        <td style={{color: o.delivery_partner_id ? '#16a34a' : '#d12948', fontWeight:'bold'}}>
                          {o.delivery_partner_id ? `Assigned to ID: #${o.delivery_partner_id}` : 'UNASSIGNED'}
                        </td>
                        <td>
                          <select 
                            onChange={(e) => handleAssignOrder(o.id, e.target.value)}
                            value={o.delivery_partner_id || ''}
                            style={{padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold'}}
                          >
                            <option value="" disabled>Force Assign Rider</option>
                            {riders.map(r => (
                              <option key={r.id} value={r.id}>
                                #{r.id} - {r.name} ({r.is_online ? 'ONLINE' : 'OFFLINE'})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                  {allOrders.length === 0 && (
                    <tr><td colSpan="5" style={{textAlign:'center', padding:30}}>All dispatches cleared for now.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
