import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ReactSignatureCanvas from 'react-signature-canvas';
import ExcelJS from 'exceljs';
import '../pages/Dashboard/Dashboard.css';
import './DaycareDashboard.css';
// Constance Shi
const DaycareDashboard = () => {
  const { id: daycareId } = useParams();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [daycare, setDaycare] = useState(null);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRemoveForm, setShowRemoveForm] = useState(false);
  const [newChild, setNewChild] = useState({
    name: '',
    dob: '',
    // Add more fields as needed
  });
  const [removeChild, setRemoveChild] = useState({ name: '', dob: '' });
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureChild, setSignatureChild] = useState(null);
  const [signatureType, setSignatureType] = useState(''); // 'check_in' or 'check_out'
  const sigPadRef = useRef();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportChild, setReportChild] = useState(null);
  const [reportMonth, setReportMonth] = useState('');
  const [reportYear, setReportYear] = useState('');
  // Mark Absent Modal state
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [absentReason, setAbsentReason] = useState('');
  const [absentChild, setAbsentChild] = useState(null);
  // Report confirmation state
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);
  const [reportBlob, setReportBlob] = useState(null);
  const [reportFileName, setReportFileName] = useState('');

  // Ensure signature pad is initialized when modal is shown
  useEffect(() => {
    if (showSignatureModal && sigPadRef.current) {
      try {
        // Ensure the canvas is resized properly without resetting
        sigPadRef.current.off(); // stop old listeners if any
        sigPadRef.current.on();  // reattach safely
      } catch (err) {
        console.warn('Signature pad init error:', err);
      }
    }
  }, [showSignatureModal]);

  // Fetch daycare details
  const fetchDaycareDetails = useCallback(async () => {
    if (!daycareId) return;
    
    const { data, error } = await supabase
      .from('Daycares')
      .select('*')
      .eq('id', daycareId)
      .single();
      
    if (error) {
      console.error('Error fetching daycare details:', error);
    } else {
      setDaycare(data || null);
    }
  }, [daycareId]);

  // Fetch children for this daycare
  const fetchRoster = useCallback(async () => {
    if (!daycareId) return;
    const { data, error } = await supabase
      .from('Roster')
      .select('*')
      .eq('daycare_id', daycareId);
    if (error) {
      console.error('Error fetching roster:', error);
      setChildren([]);
    } else {
      setChildren(data || []);
    }
  }, [daycareId]);

  useEffect(() => {
    fetchDaycareDetails();
    fetchRoster();
  }, [daycareId, fetchDaycareDetails, fetchRoster]);

  const handleChildFormChange = (e) => {
    setNewChild({ ...newChild, [e.target.name]: e.target.value });
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!newChild.name || !newChild.dob) {
      alert('Please fill out all fields.');
      return;
    }
    const { error } = await supabase.from('Roster').insert([
      { ...newChild, daycare_id: daycareId }
    ]);
    if (error) {
      alert('Error adding child: ' + error.message);
    } else {
      setShowCreateForm(false);
      setNewChild({ name: '', dob: '' });
      fetchRoster();
    }
  };

  const openSignatureModal = (child, type) => {
    setSignatureChild(child);
    setSignatureType(type);
    setShowSignatureModal(true);
  };

  const openReportModal = (child) => {
    setReportChild(child);
    setReportMonth('');
    setReportYear('');
    setShowReportModal(true);
  };

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
              justifyContent: 'center', // <-- Add this line to center vertically
              cursor: 'pointer',
              marginBottom: '28px',
              color: '#333',
              fontWeight: 500,
              fontSize: '1rem',
              width: '100%', // <-- Ensure full width for centering
              minHeight: 48, // <-- Optional: ensure enough height for vertical centering
            }}
            onClick={() => navigate('/settings')} // <-- This ensures navigation works
            tabIndex={0} // <-- Makes it keyboard accessible
            role="button" // <-- Accessibility
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/settings'); }}
          >
            <span className="settings-icon" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6em',
              width: '100%', // <-- Ensure icon is centered horizontally
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
        {/* Back to Dashboard button styled like SignUp.js */}
        <button
          className="back-btn"
          style={{
            margin: '24px 0 8px 0',
            background: 'none',
            border: 'none',
            color: '#333',
            fontWeight: 500,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/dashboard')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
            <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        
        {/* Remove the daycare name and code section from here */}
        {daycare && (
          <h1 className="dashboard-heading">{daycare.name}</h1>
        )}
        
        <h1 className="dashboard-heading">Your Roster:</h1>
        <table className="dashboard-table daycare-roster-table" style={{ marginTop: '20px' }}>
          <thead>
            <tr>
              <th>
                Edit Roster
                <button
                  className="plus-btn"
                  onClick={() => setShowAddOptions((prev) => !prev)}
                  title="Edit Roster"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
                {showAddOptions && (
                  <div style={{ marginTop: 10, background: '#fff', zIndex: 1000, position: 'relative' }}>
                    <button
                      onClick={() => {
                        setShowCreateForm(true);
                        setShowAddOptions(false);
                      }}
                      style={{ 
                        background: '#fff', 
                        color: '#333', 
                        border: '1px solid #333', 
                        padding: '10px 16px', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        marginRight: 8,
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f8f9fa';
                        e.target.style.borderColor = '#495057';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.borderColor = '#333';
                      }}
                    >
                      Add Child
                    </button>
                    <button
                      onClick={() => {
                        setShowRemoveForm(true);
                        setShowAddOptions(false);
                      }}
                      style={{ 
                        background: '#fff', 
                        color: '#d9534f', 
                        border: '1px solid #d9534f', 
                        padding: '10px 16px', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f8f9fa';
                        e.target.style.borderColor = '#c9302c';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.borderColor = '#d9534f';
                      }}
                    >
                      Remove Child
                    </button>
                  </div>
                )}
              </th>
              {/* Add daycare code in the header */}
              {daycare && (
                <th style={{ textAlign: 'left' }}>
                  <div className="code-label" style={{ marginBottom: '4px' }}>
                    Daycare Code:
                  </div>
                  <div className="code-value">{daycare.code}</div>
                </th>
              )}
            </tr>
          </thead>
        </table>
        
        {showCreateForm && (
          <div className="form-container" style={{ 
            background: 'white', 
            padding: '20px', 
            marginTop: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)', 
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            maxWidth: '400px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Add Child</h3>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)} 
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddChild} style={{ width: '100%' }}>
              <input
                name="name"
                placeholder="Child Name"
                value={newChild.name}
                onChange={handleChildFormChange}
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
                name="dob"
                type="date"
                placeholder="Date of Birth"
                value={newChild.dob}
                onChange={handleChildFormChange}
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
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
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
        
        {showRemoveForm && (
          <div className="form-container" style={{ 
            background: 'white', 
            padding: '20px', 
            marginTop: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)', 
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            maxWidth: '400px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Remove Child</h3>
              <button 
                type="button" 
                onClick={() => setShowRemoveForm(false)} 
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const { error } = await supabase
                  .from('Roster')
                  .delete()
                  .match({ name: removeChild.name, dob: removeChild.dob, daycare_id: daycareId });

                if (error) {
                  alert('Error removing child: ' + error.message);
                } else {
                  setShowRemoveForm(false);
                  setRemoveChild({ name: '', dob: '' });
                  setChildren(prev => {
                    console.log('Trying to remove:', removeChild.name, removeChild.dob);
                    prev.forEach(c => {
                      console.log('Child in list:', c.name, new Date(c.dob).toISOString().split('T')[0]);
                    });
                    return prev.filter(
                      c =>
                        !(
                          c.name === removeChild.name &&
                          new Date(c.dob).toISOString().split('T')[0] === removeChild.dob
                        )
                    );
                  });
                }
              }}
              style={{ width: '100%' }}
            >
              <input
                name="name"
                placeholder="Child Name"
                value={removeChild.name}
                onChange={(e) => setRemoveChild({ ...removeChild, [e.target.name]: e.target.value })}
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
                name="dob"
                type="date"
                placeholder="Date of Birth"
                value={removeChild.dob}
                onChange={(e) => setRemoveChild({ ...removeChild, [e.target.name]: e.target.value })}
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
                    background: '#d9534f', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setShowRemoveForm(false)}
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
        
        <table className="dashboard-table daycare-roster-table" style={{ marginTop: '20px' }}>
          <tbody>
            {children.length === 0 ? (
              <tr>
                <td>No children on this roster yet.</td>
              </tr>
            ) : (
              children.map((child, idx) => (
                <tr key={child.id || idx}>
                  <td>
                    <strong>{child.name}</strong><br />
                    DOB: {child.dob}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', marginRight: 8 }}>
                      <button
                        onClick={() => openSignatureModal(child, 'check_in')}
                        className="dashboard-action-btn"
                        type="button"
                      >
                        Check In
                      </button>
                    </span>
                    <span style={{ display: 'inline-block', marginRight: 8 }}>
                      <button
                        onClick={() => openSignatureModal(child, 'check_out')}
                        className="dashboard-action-btn"
                        type="button"
                      >
                        Check Out
                      </button>
                    </span>
                    <span style={{ display: 'inline-block', marginRight: 8 }}>
                      <button
                        onClick={() => {
                          setAbsentChild(child);
                          setShowAbsentModal(true);
                          setAbsentReason('');
                        }}
                        className="dashboard-action-btn"
                        type="button"
                      >
                        Mark Absent
                      </button>
                    </span>
                    <span style={{ display: 'inline-block' }}>
                      <button
                        onClick={() => openReportModal(child)}
                        className="dashboard-action-btn"
                        type="button"
                      >
                        View Monthly Report
                      </button>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Signature Modal */}
        {showSignatureModal && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
                  alert('Please provide a signature.');
                  return;
                }
                const signatureDataUrl = sigPadRef.current.getCanvas().toDataURL('image/png');
                // Store the current timestamp before inserting
                const currentTimestamp = new Date().toISOString();
                const { data, error } = await supabase.from('Attendance').insert([
                  {
                    child_id: signatureChild.id,
                    daycare_id: daycareId,
                    type: signatureType,
                    parent_signature: signatureDataUrl,
                    timestamp: currentTimestamp
                  }
                ]);
                console.log('Inserted attendance:', {
                  child_id: signatureChild.id,
                  type: signatureType,
                  timestamp: currentTimestamp,
                  time: new Date(currentTimestamp).toLocaleTimeString(),
                  date: new Date(currentTimestamp).toLocaleDateString(),
                  data: data,
                  error: error
                });
                if (error) {
                  console.error('Database error details:', error);
                  alert('Error saving attendance: ' + error.message);
                } else {
                  console.log('Successfully saved attendance record:', data);
                  alert(`Successfully recorded ${signatureType === 'check_in' ? 'check-in' : 'check-out'} for ${signatureChild.name}`);
                  setShowSignatureModal(false);
                  setSignatureChild(null);
                  setSignatureType('');
                }
              }}
              style={{
                background: '#fff',
                padding: 32,
                borderRadius: 8,
                minWidth: 320,
                boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
              }}
            >
              <h3>
                {signatureType === 'check_in' ? 'Check In' : 'Check Out'} for {signatureChild?.name}
              </h3>
              <label>
                Parent Signature:<br />
                <ReactSignatureCanvas
                  ref={sigPadRef}
                  penColor="black"
                  canvasProps={{
                    width: 300,
                    height: 100,
                    className: 'sigCanvas',
                    style: { border: '1px solid #ccc', borderRadius: 4 }
                  }}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => sigPadRef.current && sigPadRef.current.clear()}
                  className="dashboard-action-btn"
                  style={{ marginRight: 'auto' }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignatureModal(false)}
                  className="dashboard-action-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dashboard-action-btn"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Mark Absent Modal */}
        {showAbsentModal && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const currentTimestamp = new Date().toISOString();
                const { error } = await supabase.from('Attendance').insert([
                  {
                    child_id: absentChild.id,
                    daycare_id: daycareId,
                    type: 'absent',
                    parent_signature: '',
                    timestamp: currentTimestamp,
                    note: absentReason
                  }
                ]);
                if (error) {
                  alert('Error marking absent: ' + error.message);
                } else {
                  alert(`Successfully marked ${absentChild.name} as absent: ${absentReason}`);
                  setShowAbsentModal(false);
                  setAbsentChild(null);
                  setAbsentReason('');
                }
              }}
              style={{
                background: '#fff',
                padding: 32,
                borderRadius: 8,
                minWidth: 320,
                boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
              }}
            >
              <h3>Mark Absent for {absentChild?.name}</h3>
              <label>
                Reason:<br />
                <textarea
                  value={absentReason}
                  onChange={(e) => setAbsentReason(e.target.value)}
                  required
                  style={{ width: '100%', minHeight: '80px', marginTop: 8 }}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowAbsentModal(false)}
                  className="dashboard-action-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dashboard-action-btn"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
        {showReportModal && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                // Fetch attendance and build spreadsheet with exceljs
                try {
                  const startDate = new Date(reportYear, reportMonth - 1, 1);
                  const endDate = new Date(reportYear, reportMonth, 0);
                  // Set end date to end of day to include all records
                  endDate.setHours(23, 59, 59, 999);

                  const { data: attendanceData, error } = await supabase
                    .from('Attendance')
                    .select('*')
                    .eq('child_id', reportChild.id)
                    .gte('timestamp', startDate.toISOString())
                    .lte('timestamp', endDate.toISOString())
                    .order('timestamp', { ascending: true });

                  if (error) {
                    alert('Error fetching attendance: ' + error.message);
                    return;
                  }

                  // Debug: Log all attendance records
                  console.log('All attendance records for report:', attendanceData);
                  console.log('Total records found:', attendanceData.length);
                  console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());
                  console.log('Child ID:', reportChild.id);
                  
                  // Group records by day for easier debugging
                  const recordsByDay = {};
                  attendanceData.forEach(record => {
                    // Convert the UTC timestamp to a Date object
                    const utcDate = new Date(record.timestamp);
                    // Convert to the user's local time zone
                    const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
                    // Use the local date string for grouping (YYYY-MM-DD)
                    const localDateStr = localDate.getFullYear() + '-' +
                      String(localDate.getMonth() + 1).padStart(2, '0') + '-' +
                      String(localDate.getDate()).padStart(2, '0');

                    if (!recordsByDay[localDateStr]) {
                      recordsByDay[localDateStr] = [];
                    }
                    recordsByDay[localDateStr].push({
                      ...record,
                      type: record.type,
                      time: localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                      hasSignature: !!record.parent_signature,
                      note: record.note || null,
                      timestamp: record.timestamp
                    });
                  });
                  console.log('Records grouped by day:', recordsByDay);

                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Report');

                  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startDate);

                  // Add title rows before header
                  const titleRow = sheet.addRow([`${reportChild.name}'s ${monthName} ${reportYear} Attendance`]);
                  titleRow.font = { bold: true, size: 14 };
                  sheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
                  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

                  sheet.addRow([]); // Spacer
                  sheet.addRow(['Date', 'Time In', 'Check-In Signature', 'Time Out', 'Check-Out Signature']);
                  
                  
                  sheet.columns = [
                    { key: 'date', width: 20 },
                    { key: 'timeIn', width: 20 },
                    { key: 'checkInSig', width: 30 },
                    { key: 'timeOut', width: 20 },
                    { key: 'checkOutSig', width: 30 },
                  ];

                  const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();

                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(reportYear, reportMonth - 1, day);
                    
                    // Create local date string for matching
                    const localDayStr = date.getFullYear() + '-' + 
                      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(date.getDate()).padStart(2, '0');
                    
                    // Get day of week
                    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const dayOfWeek = daysOfWeek[date.getDay()];
                    const dateWithDay = `${localDayStr} (${dayOfWeek})`;

                    // Find attendance records for this day using local date string
                    const dayRecords = recordsByDay[localDayStr] || [];
                    
                    const checkIn = dayRecords.find(r => r.type === 'check_in');
                    const checkOut = dayRecords.find(r => r.type === 'check_out');
                    const absent = dayRecords.find(r => r.type === 'absent');

                    // Enhanced debugging
                    if (dayRecords.length > 0) {
                      console.log(`Processing ${localDayStr} with ${dayRecords.length} records:`, dayRecords);
                      console.log('Check-in found:', !!checkIn, checkIn ? 'with signature:' + !!checkIn.hasSignature : '');
                      console.log('Check-out found:', !!checkOut, checkOut ? 'with signature:' + !!checkOut.hasSignature : '');
                      console.log('Absent found:', !!absent);
                    }

                    // For debugging
                    if (checkIn || checkOut || absent) {
                      console.log(`Found records for ${localDayStr}:`, 
                        checkIn ? `Check-in at ${checkIn.time}` : 'No check-in',
                        checkOut ? `Check-out at ${checkOut.time}` : 'No check-out',
                        absent ? `Absent: ${absent.note}` : 'Not absent'
                      );
                    }

                    const checkInNote = absent?.note ? `Absent: ${absent.note}` : null;

                    // Helper to convert UTC timestamp string to local time string (system time zone)
                    const formatLocalTime = (timestamp) => {
                      if (!timestamp) return '';
                      // Parse the UTC timestamp string
                      const utcDate = new Date(timestamp);
                      // Get the user's local time zone offset in minutes
                      const tzOffsetMinutes = utcDate.getTimezoneOffset();
                      // Adjust the date by the offset (convert UTC to local)
                      const localDate = new Date(utcDate.getTime() - tzOffsetMinutes * 60000);
                      // Format as local time string (hour:minute AM/PM)
                      return localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                    };

                    const checkInTime = checkIn?.timestamp ? formatLocalTime(checkIn.timestamp) : (absent?.note ? `Absent: ${absent.note}` : '');
                    const checkOutTime = checkOut?.timestamp ? formatLocalTime(checkOut.timestamp) : '';

                    const rowData = {
                      date: dateWithDay,
                      timeIn: checkInTime,
                      checkInSig: '',
                      timeOut: checkOutTime,
                      checkOutSig: '',
                    };
                    const row = sheet.addRow(rowData);

                    // Set row height for signature visibility (smaller, e.g. 50)
                    if (checkIn?.hasSignature || checkOut?.hasSignature) {
                      row.height = 50;
                    }

                    // Add signature images if they exist
                    if (checkIn?.hasSignature && checkIn.parent_signature) {
                      try {
                        const base64 = checkIn.parent_signature.replace(/^data:image\/png;base64,/, '');
                        const imageId = workbook.addImage({ base64, extension: 'png' });
                        // Full width, but not too tall (more vertical inset)
                        sheet.addImage(imageId, {
                          tl: { col: 2, row: row.number - 1 + 0.25 }, // start at left edge, inset top
                          br: { col: 3, row: row.number - 0.25 },     // end at right edge, inset bottom
                          editAs: 'oneCell'
                        });
                      } catch (err) {
                        console.error('Error adding check-in signature image:', err);
                      }
                    }

                    if (checkOut?.hasSignature && checkOut.parent_signature) {
                      try {
                        const base64 = checkOut.parent_signature.replace(/^data:image\/png;base64,/, '');
                        const imageId = workbook.addImage({ base64, extension: 'png' });
                        // Full width, but not too tall (more vertical inset)
                        sheet.addImage(imageId, {
                          tl: { col: 4, row: row.number - 1 + 0.25 },
                          br: { col: 5, row: row.number - 0.25 },
                          editAs: 'oneCell'
                        });
                      } catch (err) {
                        console.error('Error adding check-out signature image:', err);
                      }
                    }
                  }

                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  });
                  
                  // Instead of automatically downloading, show confirmation dialog
                  const fileName = `${reportChild.name}_${monthName}_${reportYear}_Attendance.xlsx`;
                  
                  setReportBlob(blob);
                  setReportFileName(fileName);
                  setShowReportModal(false);
                  setShowReportConfirmation(true);
                } catch (err) {
                  alert('Error generating report: ' + err.message);
                }
              }}
              style={{
                background: '#fff',
                padding: 32,
                borderRadius: 8,
                minWidth: 380,
                boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
              }}
            >
              <h3>Monthly Report for {reportChild?.name}</h3>
              <div style={{ marginBottom: 24, paddingLeft: 0, paddingRight: 0 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Month:
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    required
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 12px',
                      marginTop: 6,
                      fontSize: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </label>
              </div>
              
              <div style={{ marginBottom: 28, paddingLeft: 0, paddingRight: 0 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Year:
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={reportYear}
                    onChange={(e) => setReportYear(e.target.value)}
                    required
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 12px',
                      marginTop: 6,
                      fontSize: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button 
                  type="button" 
                  onClick={() => setShowReportModal(false)}
                  style={{ 
                    background: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '500',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ 
                    background: '#2563eb', 
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '500',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
        {showReportConfirmation && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <div
              style={{
                background: '#fff',
                padding: 32,
                borderRadius: 8,
                minWidth: 320,
                boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
              }}
            >
              <h3>Report Generated</h3>
              <p>Your report has been generated successfully. Would you like to download it now?</p>
              <p style={{ fontSize: '0.9em', color: '#666' }}>{reportFileName}</p>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowReportConfirmation(false);
                    setReportBlob(null);
                    setReportFileName('');
                  }}
                  style={{ 
                    background: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e0e0e0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f0f0f0';
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (reportBlob) {
                      const url = URL.createObjectURL(reportBlob);
                      // Create a temporary anchor element to trigger download
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = reportFileName;
                      document.body.appendChild(a);
                      a.click();
                      // Clean up
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      
                      setShowReportConfirmation(false);
                      setReportBlob(null);
                      setReportFileName('');
                    }
                  }}
                  style={{ 
                    background: '#2563eb', 
                    color: 'white',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#2563eb';
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DaycareDashboard;