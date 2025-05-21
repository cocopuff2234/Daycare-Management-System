import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InitialSettings.css';

const InitialSettings = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleRoleSelect = (role) => {
    navigate('/dashboard', { state: { role } });
  };

  return (
    <div className="initial-settings-container">
      <button onClick={handleBack} className="back-button">← Back to Home</button>
      <h2 className="initial-settings-heading">You are a:</h2>
      <div className="role-cards">
        <div
          className="role-card"
          onClick={() => handleRoleSelect('parent')}
          style={{ cursor: 'pointer' }}
        >
          <span>Parent</span>
        </div>
        <div
          className="role-card"
          onClick={() => handleRoleSelect('administrator')}
          style={{ cursor: 'pointer' }}
        >
          <span>Administrator</span>
        </div>
      </div>
    </div>
  );
};

export default InitialSettings;