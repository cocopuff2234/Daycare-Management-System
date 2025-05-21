import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  // Sidebar is closed by default
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarVisible((v) => !v);

  const handleAddDaycare = () => {
    const code = window.prompt('Enter daycare code:');
    if (code) {
      alert(`Code entered: ${code}`);
    }
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
        {/* Sidebar content can go here */}
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
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          {sidebarVisible && (
            <span className="settings-text">Settings</span>
          )}
        </div>
        <div
          className="sidebar-signout"
          onClick={() => {
            // Clear user session here if needed
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
        <h1 className="dashboard-heading">Your Daycares:</h1>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>
                Add Daycare
                <button className="plus-btn" onClick={handleAddDaycare} title="Add Daycare">+</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Table rows for daycares can go here */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;