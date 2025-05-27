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
  const [parentSignature, setParentSignature] = useState('');
  const sigPadRef = useRef();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportChild, setReportChild] = useState(null);
  const [reportMonth, setReportMonth] = useState('');
  const [reportYear, setReportYear] = useState('');

  // Absent modal state
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [absentReason, setAbsentReason] = useState('');
  const [absentChild, setAbsentChild] = useState(null);

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
  const fetchDaycareDetails = async () => {
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
  };

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
    fetchDaycareDetails();
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
        <table className="dashboard-table daycare-roster-table">
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
                      style={{ marginRight: 8 }}
                    >
                      Add Child
                    </button>
                    <button
                      onClick={() => {
                        setShowRemoveForm(true);
                        setShowAddOptions(false);
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
                      >
                        Check In
                      </button>
                    </span>
                    <span style={{ display: 'inline-block', marginRight: 8 }}>
                      <button
                        onClick={() => openSignatureModal(child, 'check_out')}
                      >
                        Check Out
                      </button>
                    </span>
                    <span style={{ display: 'inline-block' }}>
                      <button onClick={() => openReportModal(child)}>
                        View Monthly Report
                      </button>
                    </span>
                    <span style={{ display: 'inline-block', marginLeft: 8 }}>
                      <button onClick={() => {
                        setAbsentChild(child);
                        setAbsentReason('');
                        setShowAbsentModal(true);
                      }}>
                        Mark Absent
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
        {showRemoveForm && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const { data, error } = await supabase
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
            style={{ marginTop: 20 }}
          >
            <h3>Remove Child</h3>
            <input
              name="name"
              placeholder="Child Name"
              value={removeChild.name}
              onChange={(e) => setRemoveChild({ ...removeChild, [e.target.name]: e.target.value })}
              required
            /><br />
            <input
              name="dob"
              type="date"
              placeholder="Date of Birth"
              value={removeChild.dob}
              onChange={(e) => setRemoveChild({ ...removeChild, [e.target.name]: e.target.value })}
              required
            /><br />
            <button type="submit">Remove</button>
            <button type="button" onClick={() => setShowRemoveForm(false)}>Cancel</button>
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
                console.log('Inserted attendance:', data);
                if (error) {
                  alert('Error saving attendance: ' + error.message);
                } else {
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
              onSubmit={async (e) => {
                e.preventDefault();
                // Fetch attendance and build spreadsheet
                try {
                  const startDate = new Date(reportYear, reportMonth - 1, 1);
                  const endDate = new Date(reportYear, reportMonth, 0); // last day of month

                  const { data: attendanceData, error } = await supabase
                    .from('Attendance')
                    .select('*')
                    .eq('child_id', reportChild.id)
                    .gte('timestamp', startDate.toISOString())
                    .lte('timestamp', endDate.toISOString());

                  if (error) {
                    alert('Error fetching attendance: ' + error.message);
                    return;
                  }

                  const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();
                  const monthName = startDate.toLocaleString('default', { month: 'long' });
                  // Title row and spacer
                  const title = `${reportChild.name}'s ${monthName} ${reportYear} Attendance`;
                  const rows = [[title], []];
                  // Header row
                  rows.push(['Date', 'Time In', 'Check-In Signature', 'Time Out', 'Check-Out Signature']);

                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(reportYear, reportMonth - 1, day);
                    const dayStr = date.toISOString().split('T')[0];

                    const checkIn = attendanceData.find(a => a.type === 'check_in' && a.timestamp.startsWith(dayStr));
                    const checkOut = attendanceData.find(a => a.type === 'check_out' && a.timestamp.startsWith(dayStr));

                    const checkInNote = checkIn?.note ? `${checkIn.note}` : null;

                    rows.push([
                      dayStr,
                      checkInNote || (checkIn?.timestamp
                        ? new Date(checkIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''),
                      checkIn ? checkIn.parent_signature : '',
                      checkOut?.timestamp
                        ? new Date(checkOut.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '',
                      checkOut ? checkOut.parent_signature : ''
                    ]);
                  }

                  const ws = XLSX.utils.aoa_to_sheet(rows);
                  // Optionally adjust column widths
                  ws['!cols'] = [
                    { wch: 12 }, // Date
                    { wch: 10 }, // Time In
                    { wch: 25 }, // Check-In Signature
                    { wch: 10 }, // Time Out
                    { wch: 25 }  // Check-Out Signature
                  ];
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Report');

                  // Download spreadsheet (open in new tab)
                  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

                  const buffer = new ArrayBuffer(wbout.length);
                  const view = new Uint8Array(buffer);
                  for (let i = 0; i < wbout.length; ++i) {
                    view[i] = wbout.charCodeAt(i) & 0xFF;
                  }

                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = URL.createObjectURL(blob);
                  window.open(url);
                } catch (err) {
                  alert('Error generating report: ' + err.message);
                }
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
        {/* Absent Modal */}
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
                const { data, error } = await supabase.from('Attendance').insert([
                  {
                    child_id: absentChild.id,
                    daycare_id: daycareId,
                    type: 'check_in',
                    parent_signature: '',
                    timestamp: currentTimestamp,
                    note: `Absent: ${absentReason}`
                  }
                ]);
                if (error) {
                  alert('Error marking absent: ' + error.message);
                } else {
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
                <button type="button" onClick={() => setShowAbsentModal(false)}>
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