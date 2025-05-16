import React from 'react'; // Ensure React is imported
import './SignUpButton.css'; // Ensure the CSS file is imported

const SignUpButton = ({ onClick }) => {
  return (
    <button className="sign-up-button" onClick={onClick}>
      Contact us
    </button>
  );
};

export default SignUpButton; // Ensure the component is exported correctly