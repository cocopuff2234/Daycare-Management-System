import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import SignUpButton from './SignUpButton'; 
import SignInButton from './SignInButton';
import About from './About'; 
import SignUp from './SignUp';
import { Typewriter } from 'react-simple-typewriter';

const Home = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleSignInClick = () => {
    console.log("Sign In button clicked");
  };

  return (
    <div>
      <div className="App">
        <h1 className="main-heading">
          <Typewriter
            words={['DaycareOS']}
            loop={0}
            cursor
            cursorStyle="|"
            typeSpeed={120}
            deleteSpeed={100}
            delaySpeed={2000}
          />
        </h1>
        <p className="sub-heading">Streamline communication, attendance tracking, and billing,</p>
        <p className="sub-heading">giving you more time to focus on what matters most</p>
        <p className="sub-heading">—the children</p>
        <SignUpButton onClick={handleSignUpClick} />
        <SignInButton onClick={handleSignInClick} />
      </div>
      <About />
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

