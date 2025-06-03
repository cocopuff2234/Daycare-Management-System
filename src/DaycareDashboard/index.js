import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ChildrenRoster from './components/ChildrenRoster';
import AddChildForm from './components/AddChildForm';
import RemoveChildForm from './components/RemoveChildForm';
import SignatureModal from './components/SignatureModal';
import AbsenceModal from './components/AbsenceModal';
import ReportModal from './components/ReportModal';
import ReportConfirmationModal from './components/ReportConfirmationModal';
import Sidebar from './components/Sidebar';
import { DaycareProvider } from './context/DaycareContext';
import './DaycareDashboard.css';

const DaycareDashboard = () => {
  const { id: daycareId } = useParams();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [daycare, setDaycare] = useState(null);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRemoveForm, setShowRemoveForm] = useState(false);
  
  // Signature modal state
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureChild, setSignatureChild] = useState(null);
  const [signatureType, setSignatureType] = useState(''); // 'check_in' or 'check_out'
  
  // Absent modal state
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [absentReason, setAbsentReason] = useState('');
  const [absentChild, setAbsentChild] = useState(null);
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportChild, setReportChild] = useState(null);
  const [reportMonth, setReportMonth] = useState('');
  const [reportYear, setReportYear] = useState('');
  
  // Report confirmation state
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);
  const [reportBlob, setReportBlob] = useState(null);
  const [reportFileName, setReportFileName] = useState('');

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

  // Open modal handlers
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

  const openAbsentModal = (child) => {
    setAbsentChild(child);
    setAbsentReason('');
    setShowAbsentModal(true);
  };

  // Context value for provider
  const contextValue = {
    daycareId,
    daycare,
    children,
    fetchRoster,
    navigate
  };

  return (
    <DaycareProvider value={contextValue}>
      <div className="dashboard-container">
        <Sidebar navigate={navigate} />
        
        <div className="dashboard-main">
          {/* Back to Dashboard button */}
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
          
          {daycare && (
            <h1 className="dashboard-heading">{daycare.name}</h1>
          )}
          
          <h1 className="dashboard-heading">Your Roster:</h1>
          
          {/* Edit Roster Header */}
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
          
          {/* Forms and Children Roster */}
          {showCreateForm && (
            <AddChildForm 
              daycareId={daycareId}
              setShowCreateForm={setShowCreateForm}
              fetchRoster={fetchRoster}
            />
          )}
          
          {showRemoveForm && (
            <RemoveChildForm 
              daycareId={daycareId}
              setShowRemoveForm={setShowRemoveForm}
              setChildren={setChildren}
            />
          )}
          
          <ChildrenRoster 
            children={children}
            openSignatureModal={openSignatureModal}
            openAbsentModal={openAbsentModal}
            openReportModal={openReportModal}
          />
          
          {/* Modals */}
          {showSignatureModal && (
            <SignatureModal 
              signatureChild={signatureChild}
              signatureType={signatureType}
              daycareId={daycareId}
              setShowSignatureModal={setShowSignatureModal}
              setSignatureChild={setSignatureChild}
              setSignatureType={setSignatureType}
            />
          )}
          
          {showAbsentModal && (
            <AbsenceModal 
              absentChild={absentChild}
              absentReason={absentReason}
              setAbsentReason={setAbsentReason}
              daycareId={daycareId}
              setShowAbsentModal={setShowAbsentModal}
              setAbsentChild={setAbsentChild}
            />
          )}
          
          {showReportModal && (
            <ReportModal 
              reportChild={reportChild}
              reportMonth={reportMonth}
              reportYear={reportYear}
              setReportMonth={setReportMonth}
              setReportYear={setReportYear}
              setShowReportModal={setShowReportModal}
              setShowReportConfirmation={setShowReportConfirmation}
              setReportBlob={setReportBlob}
              setReportFileName={setReportFileName}
            />
          )}
          
          {showReportConfirmation && (
            <ReportConfirmationModal 
              reportFileName={reportFileName}
              reportBlob={reportBlob}
              setShowReportConfirmation={setShowReportConfirmation}
              setReportBlob={setReportBlob}
              setReportFileName={setReportFileName}
            />
          )}
        </div>
      </div>
    </DaycareProvider>
  );
};

export default DaycareDashboard;