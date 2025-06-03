import React from 'react';
import { useChildrenManagement } from '../hooks/useChildrenManagement';

const AddChildForm = ({ daycareId, setShowCreateForm, fetchRoster }) => {
  const { newChild, handleChildFormChange, addChild } = useChildrenManagement(daycareId, fetchRoster);

  const handleSubmit = async (e) => {
    const success = await addChild(e);
    if (success) {
      setShowCreateForm(false);
    }
  };

  return (
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
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
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
  );
};

export default AddChildForm;
