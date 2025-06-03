import React from 'react';
import { useReportGeneration } from '../hooks/useReportGeneration';
import { useDaycare } from '../context/DaycareContext';

const ReportModal = ({
  reportChild,
  reportMonth,
  reportYear,
  setReportMonth,
  setReportYear,
  setShowReportModal,
  setShowReportConfirmation,
  setReportBlob,
  setReportFileName
}) => {
  const { daycareId } = useDaycare();
  const { generateReport } = useReportGeneration(daycareId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Fetch attendance and build spreadsheet with exceljs
      const { blob, fileName } = await generateReport(reportChild, reportMonth, reportYear);
      
      // Instead of automatically downloading, show confirmation dialog
      setReportBlob(blob);
      setReportFileName(fileName);
      setShowReportModal(false);
      setShowReportConfirmation(true);
    } catch (err) {
      alert('Error generating report: ' + err.message);
    }
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
  );
};

export default ReportModal;
