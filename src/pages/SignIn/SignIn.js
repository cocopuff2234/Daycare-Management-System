import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import { supabase } from '../../supabaseClient';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);

      // Supabase sign in
      const { error, user } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setErrors({ password: error.message });
        setIsSubmitting(false);
      } else {
        // Redirect to dashboard if sign in is successful
        navigate('/dashboard');
      }
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSignUpRedirect = () => {
    navigate('/signup');
  };

  return (
    <div className="signup-container">
      <button onClick={handleBack} className="back-button">← Back to Home</button>
      <h2>Welcome Back!</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>
        <button type="submit" disabled={isSubmitting} className="signup-button">
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <div className="signup-redirect">
        <p>Don't have an account?</p>
        <p className="signup-link" onClick={handleSignUpRedirect}>Click here!</p>
        <p>Forgot your password?</p>
        <button
          className="reset-link"
          type="button"
          onClick={() => navigate('/reset-password')}
        >
          Reset it
        </button>
      </div>
    </div>
  );
};

export default SignIn;