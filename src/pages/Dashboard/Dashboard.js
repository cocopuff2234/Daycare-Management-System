import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Dashboard.css';

const Dashboard = () => {
  const location = useLocation();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // State for user role
  const [role, setRole] = useState(null);

  // Admin-specific state
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [daycares, setDaycares] = useState([]);
  const [newDaycare, setNewDaycare] = useState({
    name: '',
    address: '',
    phone: ''
  });

  const fetchDaycares = async () => {
    const { data, error } = await supabase.from('Daycares').select('*');
    if (!error && data) setDaycares(data);
  };

  // Fetch user role from Users table
  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (user) {
        const { data, error } = await supabase
          .from('Users')
          .select('*')
          .eq('id', user.id)
          .single();
        console.log('Fetched user row:', data, error);
        if (data && data.role) {
          setRole(data.role);
        }
      }
    };
    fetchRole();
  }, []);

  // Fetch daycares on mount
  useEffect(() => {
    fetchDaycares();
  }, []);

  // Handle form input
  const handleFormChange = (e) => {
    setNewDaycare({ ...newDaycare, [e.target.name]: e.target.value });
  };

  // Handle create daycare
  const handleCreateDaycare = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be signed in to create a daycare.');
      return;
    }

    const { error } = await supabase.from('Daycares').insert([{
      ...newDaycare,
      user_id: user.id
    }]);

    if (error) {
      alert('Error creating daycare: ' + error.message);
    } else {
      setShowCreateForm(false);
      await fetchDaycares(); // <-- Refresh the list after creation
    }
  };

  // Handle join by code
  const handleJoinByCode = () => {
    const code = window.prompt('Enter daycare code:');
    if (code) {
      // You would look up the daycare by code here
      alert(`Joining daycare with code: ${code}`);
      setShowAddOptions(false);
    }
  };

  const toggleSidebar = () => setSidebarVisible((v) => !v);

  console.log('role:', role, 'showAddOptions:', showAddOptions, 'showCreateForm:', showCreateForm);

  return (
    <div className="dashboard-container">
      <aside className={`dashboard-sidebar${sidebarVisible ? ' visible' : ' hidden'}`}>
        <button className="hide-sidebar-btn" onClick={toggleSidebar} title="Toggle Sidebar">
          <span className="hamburger">
            <span />
            <span />
            <span />
          </span>
        </button>
        {/* Sidebar content can go here */}
        <div style={{ flex: 1 }} />
        <div
          className="sidebar-settings"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '24px',
            color: '#333',
            fontWeight: 500,
            fontSize: '1rem'
          }}
        >
          <span className="settings-icon" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6em'
          }}>
            {/* Simple gear icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="2"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          {sidebarVisible && (
            <span className="settings-text">Settings</span>
          )}
        </div>
        <div
          className="sidebar-signout"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          <span className="signout-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M16 17l5-5m0 0l-5-5m5 5H9" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          {sidebarVisible && (
            <span className="signout-text">Sign Out</span>
          )}
        </div>
      </aside>
      <div className="dashboard-main">
        <h1 className="dashboard-heading">Your Daycares:</h1>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>
                Add Daycare
                <button
                  className="plus-btn"
                  onClick={() => {
                    if (role === 'administrator') {
                      setShowAddOptions((prev) => !prev);
                    } else {
                      handleJoinByCode();
                    }
                  }}
                  title="Add Daycare"
                >+</button>
                {/* Show options if admin and showAddOptions is true */}
                {role === 'administrator' && showAddOptions && (
                  <div style={{ marginTop: 10, background: '#fff', zIndex: 1000, position: 'relative' }}>
                    <button
                      onClick={() => {
                        setShowCreateForm(true);
                        setShowAddOptions(false);
                      }}
                      style={{ marginRight: 8 }}
                    >
                      Create Daycare
                    </button>
                    <button
                      onClick={() => {
                        handleJoinByCode();
                        setShowAddOptions(false);
                      }}
                    >
                      With Code
                    </button>
                  </div>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {daycares.map((dc, idx) => (
              <tr key={idx}>
                <td>
                  <strong>{dc.name}</strong><br />
                  {dc.address}<br />
                  {dc.phone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Create Daycare Form */}
        {role === 'administrator' && showCreateForm && (
          <form onSubmit={handleCreateDaycare} style={{ marginTop: 20 }}>
            <h3>Create New Daycare</h3>
            <input
              name="name"
              placeholder="Daycare Name"
              value={newDaycare.name}
              onChange={handleFormChange}
              required
            /><br />
            <input
              name="address"
              placeholder="Address"
              value={newDaycare.address}
              onChange={handleFormChange}
              required
            /><br />
            <input
              name="phone"
              placeholder="Phone"
              value={newDaycare.phone}
              onChange={handleFormChange}
              required
            /><br />
            <button type="submit">Create</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Dashboard;