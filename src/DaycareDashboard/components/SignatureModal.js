import React, { useEffect } from 'react';
import ReactSignatureCanvas from 'react-signature-canvas';
import { useAttendance } from '../hooks/useAttendance';
import { initializeSignaturePad, clearSignaturePad, isSignaturePadEmpty } from '../utils/signatureUtils';

const SignatureModal = ({ 
  signatureChild, 
  signatureType, 
  daycareId, 
  setShowSignatureModal, 
  setSignatureChild, 
  setSignatureType 
}) => {
  const { sigPadRef, recordSignatureAttendance } = useAttendance(daycareId);

  // Ensure signature pad is initialized when modal is shown
  useEffect(() => {
    initializeSignaturePad(sigPadRef);
  }, [sigPadRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isSignaturePadEmpty(sigPadRef)) {
        alert('Please provide a signature.');
        return;
      }

      const { data, timestamp } = await recordSignatureAttendance(signatureChild, signatureType);
      
      console.log('Inserted attendance:', {
        child_id: signatureChild.id,
        type: signatureType,
        timestamp: timestamp,
        time: new Date(timestamp).toLocaleTimeString(),
        date: new Date(timestamp).toLocaleDateString(),
        data: data
      });
      
      alert(`Successfully recorded ${signatureType === 'check_in' ? 'check-in' : 'check-out'} for ${signatureChild.name}`);
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const closeModal = () => {
    setShowSignatureModal(false);
    setSignatureChild(null);
    setSignatureType('');
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
          <button type="button" onClick={() => clearSignaturePad(sigPadRef)}>
            Clear
          </button>
        </div>
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

export default SignatureModal;
