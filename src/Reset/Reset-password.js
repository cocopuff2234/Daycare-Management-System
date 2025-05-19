import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reset-password.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const validate = () => {
    if (!email) {
      return 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Email is invalid';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert('If this email exists, a reset link has been sent.');
      setIsSubmitting(false);
      navigate('/signin');
    }, 1000);
  };

  const handleBack = () => {
    navigate('/signin');
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <button onClick={handleBack} className="back-button">← Back to Sign In</button>
        <h2>Reset your password</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className={error ? 'error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
          </div>
          <button type="submit" disabled={isSubmitting} className="signup-button">
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;