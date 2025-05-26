import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Correct path after moving supabaseClient.js
import '../pages/Dashboard/Dashboard.css';    // Use the correct path for CSS

const Dashboard = () => {
  const location = useLocation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [daycares, setDaycares] = useState([]);
  const [newDaycare, setNewDaycare] = useState({
    name: '',
    address: '',
    phone: ''
  });

  // Fetch daycares the user created or joined
  const fetchDaycares = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found', userError);
      return;
    }

    console.log('Fetching daycares for user:', user.id);

    // 1. Get all daycare IDs where the user is a member
    const { data: memberRows, error: memberError } = await supabase
      .from('DaycareMembers')
      .select('daycare_id')
      .eq('user_id', user.id);

    if (memberError) {
      console.error('Error fetching DaycareMembers:', memberError);
      return;
    }

    const memberIds = (memberRows || []).map(r => r.daycare_id);

    let memberDaycares = [];
    if (memberIds.length > 0) {
      const { data: memberDaycareData, error: memberDataError } = await supabase
        .from('Daycares')
        .select('*')
        .in('id', memberIds);

      if (memberDataError) {
        console.error('Error fetching joined daycares:', memberDataError);
      } else {
        memberDaycares = memberDaycareData || [];
      }
    }

    // 2. Get daycares the user created
    const { data: createdRows, error: createdError } = await supabase
      .from('Daycares')
      .select('*')
      .eq('user_id', user.id);

    if (createdError) {
      console.error('Error fetching created daycares:', createdError);
    }

    const createdDaycares = createdRows || [];

    // 3. Merge and deduplicate
    const allDaycares = [...memberDaycares, ...createdDaycares]
      .filter((dc, idx, arr) => dc && arr.findIndex(d => d.id === dc.id) === idx);

    console.log('Combined daycares:', allDaycares);
    setDaycares(allDaycares);
  };

  useEffect(() => {
    fetchDaycares();
  }, []);

  const handleFormChange = (e) => {
    setNewDaycare({ ...newDaycare, [e.target.name]: e.target.value });
  };

  function generateDaycareCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Handle create daycare
  const handleCreateDaycare = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be signed in to create a daycare.');
      return;
    }
    const code = generateDaycareCode();
    const { data: insertedDaycare, error } = await supabase.from('Daycares').insert([{
      ...newDaycare,
      user_id: user.id,
      code
    }]).select();
    if (error) {
      alert('Error creating daycare: ' + error.message);
      return;
    }
    let insertedDaycareId;
    if (insertedDaycare && insertedDaycare.length > 0) {
      insertedDaycareId = insertedDaycare[0].id;
    } else if (insertedDaycare && insertedDaycare.id) {
      insertedDaycareId = insertedDaycare.id;
    } else {
      alert('Could not get new daycare ID.');
      return;
    }
    // Insert creator as a member
    const { error: memberInsertError } = await supabase.from('DaycareMembers').insert([
      { user_id: user.id, daycare_id: insertedDaycareId }
    ]);
    if (memberInsertError) {
      alert('Error adding creator as member: ' + memberInsertError.message);
    }
    setShowCreateForm(false);
    await fetchDaycares();
    alert(`Daycare created! Share this code with others to join: ${code}`);
  };

  // Handle join by code
  const handleJoinByCode = async () => {
    const code = window.prompt('Enter daycare code:');
    if (code) {
      const { data: daycare, error } = await supabase
        .from('Daycares')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !daycare) {
        alert('No daycare found with that code.');
        setShowAddOptions(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('User not found.');
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from('DaycareMembers')
        .select('*')
        .eq('user_id', user.id)
        .eq('daycare_id', daycare.id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Check existing membership error:', existingError);
      }

      if (!existing) {
        const { error: insertError } = await supabase.from('DaycareMembers').insert([
          { user_id: user.id, daycare_id: daycare.id }
        ]);
        if (insertError) {
          alert('Error joining daycare: ' + insertError.message);
          return;
        }
      }

      alert(`Joined daycare: ${daycare.name}`);
      setShowAddOptions(false);
      await fetchDaycares();
    }
  };

  const toggleSidebar = () => setSidebarVisible((v) => !v);

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
        {/* Sidebar content */}
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
        <h1 className="dashboard-heading">Your Roster:</h1>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>
                Edit Roster
                <button
                  className="plus-btn"
                  onClick={() => setShowAddOptions((prev) => !prev)}
                  title="Edit Roster"
                >+</button>
                {/* Add/Edit roster options here if needed */}
                {showAddOptions && (
                  <div style={{ marginTop: 10, background: '#fff', zIndex: 1000, position: 'relative' }}>
                    {/* You can add buttons for adding/editing children here */}
                    <button
                      onClick={() => {
                        setShowCreateForm(true);
                        setShowAddOptions(false);
                      }}
                      style={{ marginRight: 8 }}
                    >
                      Add Child
                    </button>
                  </div>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Replace with children on the roster when you have the table */}
            {daycares.map((child, idx) => (
              <tr key={idx}>
                <td>
                  <strong>{child.name}</strong><br />
                  {/* Add more child info here, e.g. age, parent contact, etc. */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Show create form for adding a child */}
        {showCreateForm && (
          <form /* onSubmit={handleAddChild} */ style={{ marginTop: 20 }}>
            <h3>Add Child</h3>
            <input
              name="name"
              placeholder="Child Name"
              // value={newChild.name}
              // onChange={handleChildFormChange}
              required
            /><br />
            {/* Add more fields as needed */}
            <button type="submit">Add</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Dashboard;