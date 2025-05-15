import React from 'react';
import './App.css'; 

const About = () => {
  return (
    <div className="about-section">
      <div className="about-header">
        <h2>What We Do:</h2>
      </div>
      <div className="about-content">
        <div className="about-card">
          <div className="about-sub-header1">
            <h3>For Administrators:</h3>
          </div>
          <div className="about-text1">
            <p>Attendance Tracking</p>
            <p>Monthly Reports</p>
            <p>Roster Management</p>
          </div>
        </div>
        <div className="about-card">
          <div className="about-sub-header2">
            <h3>For Parents:</h3>
          </div>
          <div className="about-text2">
            <p>Child Updates</p>
            <p>Daily Reports</p>
            <p>Simple Billing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;