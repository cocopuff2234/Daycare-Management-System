import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import ContactUsBtn from './ContactUsBtn'; 
import SignInBtn from './SignInBtn';
import About from './About'; 
import SignUp from './SignUp';
import { Typewriter } from 'react-simple-typewriter';

const Home = () => {
  const navigate = useNavigate();

  // Function for Sign In button navigation
  const handleSignInClick = () => {
    navigate('/signup');
  };

  // Function for Contact Us button action
  const handleContactClick = () => {
    console.log("Contact Us button clicked");
  };

  return (
    <div>
      <div className="App">
        <div className="header-buttons">
          <SignInBtn onClick={handleSignInClick} />
          <ContactUsBtn onClick={handleContactClick} />
        </div>
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

