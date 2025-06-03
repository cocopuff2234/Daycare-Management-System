import React from 'react';
import { useReportGeneration } from '../hooks/useReportGeneration';
import { useDaycare } from '../context/DaycareContext';

const ReportConfirmationModal = ({
  reportFileName,
  reportBlob,
  setShowReportConfirmation,
  setReportBlob,
  setReportFileName
}) => {
  const { daycareId } = useDaycare();
  const { downloadReport } = useReportGeneration(daycareId);

  const handleDownload = () => {
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
      
      closeModal();
    }
  };

  const closeModal = () => {
    setShowReportConfirmation(false);
    setReportBlob(null);
    setReportFileName('');
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
            onClick={closeModal}
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
            onClick={handleDownload}
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
  );
};

export default ReportConfirmationModal;
