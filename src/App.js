import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import SignUpButton from './SignUpButton'; 
import SignInButton from './SignInButton';
import SignUp from './SignUp';
import { Typewriter } from 'react-simple-typewriter';

// Home page component
const Home = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleSignInClick = () => {
    console.log("Sign In button clicked");
    // Future implementation for sign in
  };

  return (
    <div className="App">
      <h1 className="main-heading">
        <Typewriter
          words={['Daycare']}
          loop={0}
          cursor
          cursorStyle="|"
          typeSpeed={120}
          deleteSpeed={100}
          delaySpeed={2000}
        />
      </h1>
      <p className="sub-heading">Childcare made simple.</p>
      <SignUpButton onClick={handleSignUpClick} />
      <SignInButton onClick={handleSignInClick} />
      <div className="about-header">
        <h2> What we do: </h2>
      </div>
      <div className="about-sub-header1">
        <h3> For Administrators:</h3>
      </div>
      <div className="about-sub-header2">
        <h3> For Parents:</h3>
      </div>
      <div className="about-text1">
        <p> Attendance Tracking</p>
      </div>
      <div className="about-text2">
        <p> Child Updates</p>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
};

export default App;

