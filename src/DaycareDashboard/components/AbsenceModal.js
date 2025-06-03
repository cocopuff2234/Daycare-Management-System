import React from 'react';
import { useAttendance } from '../hooks/useAttendance';

const AbsenceModal = ({ 
  absentChild, 
  absentReason, 
  setAbsentReason, 
  daycareId, 
  setShowAbsentModal, 
  setAbsentChild 
}) => {
  const { recordAbsence } = useAttendance(daycareId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await recordAbsence(absentChild, absentReason);
      alert(`Successfully marked ${absentChild.name} as absent: ${absentReason}`);
      closeModal();
    } catch (error) {
      alert('Error marking absent: ' + error.message);
    }
  };

  const closeModal = () => {
    setShowAbsentModal(false);
    setAbsentChild(null);
    setAbsentReason('');
  };

  return (
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
        onSubmit={handleSubmit}
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
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AbsenceModal;
