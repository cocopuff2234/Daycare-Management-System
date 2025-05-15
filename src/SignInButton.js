import React from 'react'; 
import './SignInButton.css'; 

const SignInButton = ({ onClick }) => {
  return (
    <button className="sign-in-button" onClick={onClick}>
      Sign In
    </button>
  );
};

export default SignInButton; 