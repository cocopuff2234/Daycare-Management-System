import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../pages/SignUp/SignUp.css';

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <div className="signup-container">
      <button onClick={() => navigate('/')} className="back-button">← Back to Home</button>
      <div className="signup-card">
        <h2><center>Verify your email</center></h2>
        <p>
          <center>Please check your email for a verification link and follow the instructions there.</center><br />
          {email && (
            <>
              <br />
              <center><strong>Email sent to: {email}</strong></center>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;