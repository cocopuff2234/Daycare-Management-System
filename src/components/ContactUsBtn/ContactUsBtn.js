import React from 'react';
import './ContactUsBtn.css';

const ContactUsBtn = ({ onClick }) => {
  return (
    <button className="contact-us-btn" onClick={onClick}>
      Contact us
    </button>
  );
};

export default ContactUsBtn; 