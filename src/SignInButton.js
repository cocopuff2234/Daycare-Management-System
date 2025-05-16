import React from 'react'; 
import './SignInButton.css'; 

const SignInButton = ({ onClick }) => {
  return (
    <button className="sign-in-button" onClick={onClick}>
      Sign in
    </button>
  );
};

export default SignInButton; 