import React from 'react';
import '../../styles/App.css'; 

const About = () => {
  return (
    <div className="about-section">
      <div className="about-header">
        <h2>What We Do:</h2>
      </div>
      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-icon attendance-icon"></div>
          <h3>Attendance Tracking</h3>
          <p>Easily track check-ins and check-outs with our digital attendance system. Generate reports with a single click.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon billing-icon"></div>
          <h3>Billing & Payments</h3>
          <p>Automate invoicing, accept online payments, and keep track of all financial transactions in one place.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon communication-icon"></div>
          <h3>Parent Communication</h3>
          <p>Keep parents updated with real-time notifications, messages, and daily activity reports.</p>
        </div>
      </div>
    </div>
  );
};

export default About;