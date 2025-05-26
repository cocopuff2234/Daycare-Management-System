import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ReactSignatureCanvas from 'react-signature-canvas';
import * as XLSX from 'xlsx';
import '../pages/Dashboard/Dashboard.css';

const DaycareDashboard = () => {
  const { id: daycareId } = useParams();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChild, setNewChild] = useState({
    name: '',
    dob: '',
    // Add more fields as needed
  });
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureChild, setSignatureChild] = useState(null);
  const [signatureType, setSignatureType] = useState(''); // 'check_in' or 'check_out'
  const [parentSignature, setParentSignature] = useState('');
  const sigPadRef = useRef();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportChild, setReportChild] = useState(null);
  const [reportMonth, setReportMonth] = useState('');
  const [reportYear, setReportYear] = useState('');

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

  // Fetch children for this daycare
  const fetchRoster = async () => {
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
  };

  useEffect(() => {
    fetchRoster();
  }, [daycareId]);

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

  const toggleSidebar = () => setSidebarVisible((v) => !v);

  const openSignatureModal = (child, type) => {
    setSignatureChild(child);
    setSignatureType(type);
    setParentSignature('');
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
      <aside className={`dashboard-sidebar${sidebarVisible ? ' visible' : ' hidden'}`}>
        <button className="hide-sidebar-btn" onClick={toggleSidebar} title="Toggle Sidebar">
          <span className="hamburger">
            <span />
            <span />
            <span />
          </span>
        </button>
        {/* Removed home icon/sidebar-home */}
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
                {showAddOptions && (
                  <div style={{ marginTop: 10, background: '#fff', zIndex: 1000, position: 'relative' }}>
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
                    <span style={{ marginRight: 12 }}>
                      <button
                        onClick={() => openSignatureModal(child, 'check_in')}
                      >
                        Check In
                      </button>
                    </span>
                    <span style={{ marginRight: 12 }}>
                      <button
                        onClick={() => openSignatureModal(child, 'check_out')}
                      >
                        Check Out
                      </button>
                    </span>
                    <span style={{ marginRight: 12 }}>
                      <button onClick={() => openReportModal(child)}>
                        View Monthly Report
                      </button>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {showCreateForm && (
          <form onSubmit={handleAddChild} style={{ marginTop: 20 }}>
            <h3>Add Child</h3>
            <input
              name="name"
              placeholder="Child Name"
              value={newChild.name}
              onChange={handleChildFormChange}
              required
            /><br />
            <input
              name="dob"
              type="date"
              placeholder="Date of Birth"
              value={newChild.dob}
              onChange={handleChildFormChange}
              required
            /><br />
            <button type="submit">Add</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </form>
        )}
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
                // Save signatureDataUrl to Supabase (as text or upload as file)
                const { error } = await supabase.from('Attendance').insert([
                  {
                    child_id: signatureChild.id,
                    daycare_id: daycareId,
                    type: signatureType,
                    parent_signature: signatureDataUrl,
                    timestamp: new Date().toISOString()
                  }
                ]);
                if (error) {
                  alert('Error saving attendance: ' + error.message);
                } else {
                  if (signatureType === 'check_in') {
                    const time = new Date().toLocaleString();
                    const entry = {
                      Name: signatureChild?.name,
                      CheckInTime: time,
                      Signature: signatureDataUrl
                    };

                    const ws = XLSX.utils.json_to_sheet([entry]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'CheckIns');

                    const blob = new Blob([XLSX.write(wb, { type: 'binary', bookType: 'xlsx' })], { type: 'application/octet-stream' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `CheckIn_${signatureChild?.name}_${Date.now()}.xlsx`;
                    a.click();
                  }
                  setShowSignatureModal(false);
                  setSignatureChild(null);
                  setSignatureType('');
                  setParentSignature('');
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
              <div style={{ marginTop: 16, marginBottom: 8 }}>
                <button type="button" onClick={() => sigPadRef.current && sigPadRef.current.clear()}>
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button type="button" onClick={() => setShowSignatureModal(false)}>
                  Cancel
                </button>
                <button type="submit">Submit</button>
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
              onSubmit={(e) => {
                e.preventDefault();
                // Placeholder: replace with report fetching logic
                alert(`Fetching report for ${reportChild?.name}, ${reportMonth}/${reportYear}`);
                setShowReportModal(false);
              }}
              style={{
                background: '#fff',
                padding: 32,
                borderRadius: 8,
                minWidth: 320,
                boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
              }}
            >
              <h3>Monthly Report for {reportChild?.name}</h3>
              <label>
                Month:
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  required
                />
              </label>
              <br />
              <label>
                Year:
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={reportYear}
                  onChange={(e) => setReportYear(e.target.value)}
                  required
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button type="button" onClick={() => setShowReportModal(false)}>
                  Cancel
                </button>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DaycareDashboard;