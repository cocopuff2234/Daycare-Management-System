import React from 'react';
import './SignInBtn.css';

const SignInBtn = ({ onClick }) => {
  return (
    <button className="sign-in-btn" onClick={onClick}>
      Sign in
    </button>
  );
};

export default SignInBtn; 