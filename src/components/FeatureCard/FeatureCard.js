import React from 'react';
import './FeatureCard.css';

const FeatureCard = ({ title, description }) => {
  // Return different formatted content based on the card title
  const getFormattedDescription = () => {
    if (title === "Attendance Tracking") {
      return (
        <>
          Real-time check-in/out with digital<br />records
        </>
      );
    } else if (title === "Smart Communication") {
      return (
        <>
          Collaborate with other admins using<br />a simple join code
        </>
      );
    } else if (title === "Simplified Billing") {
      return (
        <>
          Automated spreadsheets for<br />detailed monthly reports
        </>
      );
    }
    
    return description;
  };
  
  return (
    <div className="feature-card">
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{getFormattedDescription()}</p>
    </div>
  );
};

export default FeatureCard;