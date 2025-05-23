import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './styles/App.css';
import ContactUsBtn from './components/ContactUsBtn/ContactUsBtn'; 
import SignInBtn from './components/SignInBtn/SignInBtn';
import About from './pages/About/About'; 
import SignIn from './pages/SignIn/SignIn';
import { Typewriter } from 'react-simple-typewriter';
import SignUp from './pages/SignUp/SignUp';
import Contact from './pages/Contact/Contact';
import ResetPassword from './Reset/Reset-password';
import InitialSettings from './pages/InitialSettings/InitialSettings';
import Dashboard from './pages/Dashboard/Dashboard';

const Home = ({ onNavigate }) => {
  const navigate = useNavigate();

  // Function for Sign In button navigation
  const handleSignInClick = () => {
    onNavigate(); // Trigger animation
    navigate('/signin');
  };

  // Function for Contact Us button action
  const handleContactClick = () => {
    onNavigate(); // Trigger animation
    navigate('/contact');
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
  const [fadeClass, setFadeClass] = useState(''); // State to manage the fade-in class

  const triggerFadeIn = () => {
    setFadeClass('fade-in'); // Add the fade-in class
    setTimeout(() => setFadeClass(''), 500); // Remove the class after the animation duration
  };

  return (
    <Router>
      <div className={fadeClass}> {/* Dynamically apply the fade-in class */}
        <Routes>
          <Route path="/" element={<Home onNavigate={triggerFadeIn} />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/initial-settings" element={<InitialSettings />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

