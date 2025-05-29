import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Dashboard.css';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [daycares, setDaycares] = useState([]);
  const [children, setChildren] = useState([]);
  const [newDaycare, setNewDaycare] = useState({
    name: '',
    address: '',
    phone: ''
  });
  // Fetch children for the user
  const fetchChildren = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Children')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching children:', error);
        setChildren([]);
      } else {
        setChildren(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching children:', err);
      setChildren([]);
    }
  };

  // Reset form function
  const resetDaycareForm = () => {
    setNewDaycare({
      name: '',
      address: '',
      phone: ''
    });
  };

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

  const handleLeaveDaycare = async (daycareId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('User not found');
      return;
    }

    console.log('Attempting to remove daycare membership:', { userId: user.id, daycareId });

    // Optimistically remove daycare from local state
    setDaycares((prev) => prev.filter(dc => dc.id !== daycareId));

    try {
      // Check if the user is the creator of the daycare
      const { data: daycare, error: fetchError } = await supabase
        .from('Daycares')
        .select('user_id')
        .eq('id', daycareId)
        .single();

      if (fetchError) {
        console.error('Error checking daycare ownership:', fetchError);
        alert('Error checking daycare ownership: ' + fetchError.message);
        // Revert removal since backend check failed
        await fetchDaycares();
        return;
      }

      if (daycare.user_id === user.id) {
        const confirmDelete = window.confirm('You are the creator of this daycare. Deleting it will remove all associated data. Are you sure?');
        if (!confirmDelete) {
          // User canceled, revert removal
          await fetchDaycares();
          return;
        }

        console.log('Deleting daycare members for daycare:', daycareId);
        const { error: deleteMembersError } = await supabase
          .from('DaycareMembers')
          .delete()
          .eq('daycare_id', daycareId);

        if (deleteMembersError) {
          console.error('Error deleting daycare members:', deleteMembersError);
        } else {
          console.log('Deleted daycare members successfully');
        }

        console.log('Deleting daycare:', daycareId);
        const { error: deleteDaycareError } = await supabase
          .from('Daycares')
          .delete()
          .eq('id', daycareId);

        if (deleteDaycareError) {
          console.error('Error deleting daycare:', deleteDaycareError);
        } else {
          console.log('Deleted daycare successfully');
        }

        if (deleteMembersError || deleteDaycareError) {
          alert('Failed to delete daycare: ' + (deleteMembersError?.message || deleteDaycareError?.message));
          await fetchDaycares(); // revert
          return;
        }

        // No need to fetch again because we already removed it optimistically
        return;
      }

      console.log('Deleting user membership for daycare:', daycareId);
      // Remove user from DaycareMembers
      const { error } = await supabase
        .from('DaycareMembers')
        .delete()
        .match({ user_id: user.id, daycare_id: daycareId });

      if (error) {
        console.error('Failed to delete membership:', error);
        alert('Failed to leave daycare: ' + error.message);
        await fetchDaycares(); // revert state if failure
      } else {
        console.log('Deleted membership successfully');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Unexpected error: ' + err.message);
      await fetchDaycares(); // revert
    }
  };

  useEffect(() => {
    fetchDaycares();
    fetchChildren();
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
    resetDaycareForm();
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

  // Handle direct form toggle
  const toggleCreateForm = () => {
    if (!showCreateForm) {
      resetDaycareForm();
    }
    setShowCreateForm(!showCreateForm);
    setShowAddOptions(false);
  };

  // Replace handleRemoveChild with a direct version (for reference/future use):
  // const handleRemoveChild = async (childId) => {
  //   const { data: { user } } = await supabase.auth.getUser();
  //   if (!user) {
  //     alert('User not found');
  //     return;
  //   }
  //
  //   // Optimistically remove from UI
  //   setChildren((prev) => prev.filter(child => child.id !== childId));
  //
  //   try {
  //     const { error } = await supabase
  //       .from('Children')
  //       .delete()
  //       .match({ id: childId, user_id: user.id });
  //
  //     if (error) {
  //       console.error('Error deleting child:', error);
  //       alert('Failed to remove child: ' + error.message);
  //       await fetchChildren(); // Revert UI
  //     } else {
  //       console.log('Child successfully deleted');
  //     }
  //   } catch (err) {
  //     console.error('Unexpected error deleting child:', err);
  //     alert('Unexpected error: ' + err.message);
  //     await fetchChildren(); // Revert UI
  //   }
  // };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        {/* Top part of sidebar */}
        <div style={{ flex: 1 }}>
          {/* This can contain any future sidebar menu items */}
        </div>
        
        {/* Bottom part with settings and sign out - always visible */}
        <div style={{ 
          position: 'absolute',
          bottom: '50px',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div
            className="sidebar-settings"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: '28px',
              color: '#333',
              fontWeight: 500,
              fontSize: '1rem'
            }}
            onClick={() => navigate('/settings')}
          >
            <span className="settings-icon" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6em'
            }}>
              {/* Gear icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
          </div>
          <div
            className="sidebar-signout"
            onClick={() => {
              window.location.href = '/';
            }}
            style={{ marginTop: 0 }}
          >
            <span className="signout-icon">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M16 17l5-5m0 0l-5-5m5 5H9" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>
      </aside>
      <div className="dashboard-main">
        <h1 className="dashboard-heading">Your Daycares:</h1>
        
        <div className="dashboard-actions" style={{ marginBottom: '20px' }}>
          <button 
            onClick={toggleCreateForm}
            style={{ 
              background: '#333', 
              color: '#fff', 
              border: 'none', 
              padding: '10px 16px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Add Daycare
          </button>
          <button 
            onClick={handleJoinByCode}
            style={{ 
              background: '#fff', 
              color: '#333', 
              border: '1px solid #333', 
              padding: '10px 16px', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Join by Code
          </button>
        </div>
        
        {showCreateForm && (
          <div className="form-container" style={{ 
            background: 'white', 
            padding: '20px', 
            marginBottom: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)', 
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            maxWidth: '400px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Add Daycare</h3>
              <button 
                type="button" 
                onClick={toggleCreateForm} 
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateDaycare} style={{ width: '100%' }}>
              <input
                name="name"
                placeholder="Daycare Name"
                value={newDaycare.name}
                onChange={handleFormChange}
                style={{ 
                  display: 'block', 
                  margin: '10px 0', 
                  padding: '8px 12px', 
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                required
              />
              <input
                name="address"
                placeholder="Address"
                value={newDaycare.address}
                onChange={handleFormChange}
                style={{ 
                  display: 'block', 
                  margin: '10px 0', 
                  padding: '8px 12px', 
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                required
              />
              <input
                name="phone"
                placeholder="Phone Number"
                value={newDaycare.phone}
                onChange={handleFormChange}
                style={{ 
                  display: 'block', 
                  margin: '10px 0', 
                  padding: '8px 12px', 
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                required
              />
              <div style={{ marginTop: 16 }}>
                <button
                  type="submit"
                  style={{ 
                    padding: '10px 16px', 
                    marginRight: 8, 
                    background: '#333', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={toggleCreateForm}
                  style={{ 
                    padding: '10px 16px', 
                    background: 'none', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Daycare Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {daycares.length === 0 ? (
              <tr>
                <td colSpan="4">No daycares found. Add a daycare to get started.</td>
              </tr>
            ) : (
              daycares.map((daycare, idx) => (
                <tr key={daycare.id || idx}>
                  <td>{daycare.name}</td>
                  <td>{daycare.address}</td>
                  <td>{daycare.phone}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/daycare/${daycare.id}`)}
                      style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer', marginRight: '8px' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleLeaveDaycare(daycare.id)}
                      style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;