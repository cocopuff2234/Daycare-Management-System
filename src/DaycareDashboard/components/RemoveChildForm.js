import React from 'react';
import { useChildrenManagement } from '../hooks/useChildrenManagement';

const RemoveChildForm = ({ daycareId, setShowRemoveForm, setChildren }) => {
  const { removeChild, handleRemoveChildFormChange, removeChildFromRoster } = useChildrenManagement(
    daycareId, 
    null // We'll handle roster update manually through setChildren
  );

  const handleSubmit = async (e) => {
    const success = await removeChildFromRoster(e);
    if (success) {
      setShowRemoveForm(false);
      
      // Update children list to filter out the removed child
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
        onSubmit={handleSubmit}
        style={{ width: '100%' }}
      >
        <input
          name="name"
          placeholder="Child Name"
          value={removeChild.name}
          onChange={handleRemoveChildFormChange}
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
          onChange={handleRemoveChildFormChange}
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
  );
};

export default RemoveChildForm;
