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
        <div style={{ flex: 1 }} /> {/* Spacer to push sign out to bottom */}
        <div
          className="sidebar-signout"
          onClick={() => {
            // Clear user session here if needed (e.g., localStorage.removeItem('token'))
            window.location.href = '/';
          }}
        >
          <span className="signout-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M16 17l5-5m0 0l-5-5m5 5H9" stroke="#4e95ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" stroke="#4e95ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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