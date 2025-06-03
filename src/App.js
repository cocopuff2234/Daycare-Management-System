import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './styles/App.css';
import ContactUsBtn from './components/ContactUsBtn/ContactUsBtn'; 
import SignInBtn from './components/SignInBtn/SignInBtn';
import SignIn from './pages/SignIn/SignIn';
import { Typewriter } from 'react-simple-typewriter';
import SignUp from './pages/SignUp/SignUp';
import Contact from './pages/Contact/Contact';
import ResetPassword from './Reset/Reset-password';
import Dashboard from './pages/Dashboard/Dashboard';
import Settings from './pages/Settings/Settings';
import VerifyPage from './VerifyPage/VerifyPage';
import DaycareDashboard from './DaycareDashboard';
import FeatureCard from './components/FeatureCard/FeatureCard';

// Custom component for typewriter effect with styled parts
const TypewriterWithStyledParts = () => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const fullText = 'DaycareOS';
  const typingSpeed = 120; // milliseconds per character
  const deletingSpeed = 100; // milliseconds per character when deleting
  const delayAfterType = 2000; // delay before starting to delete
  const delayAfterDelete = 1000; // delay before starting to type again
  
  useEffect(() => {
    let timeout;
    
    if (!isDeleting && text.length < fullText.length) {
      // Typing forward
      timeout = setTimeout(() => {
        setText(fullText.slice(0, text.length + 1));
      }, typingSpeed);
    } 
    else if (!isDeleting && text.length === fullText.length) {
      // Finished typing, wait before delete
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delayAfterType);
    }
    else if (isDeleting && text.length > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setText(text.slice(0, text.length - 1));
      }, deletingSpeed);
    }
    else if (isDeleting && text.length === 0) {
      // Finished deleting, wait before typing again
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      timeout = setTimeout(() => {
        // This empty function is intentional - when isDeleting changes
        // the first condition will be triggered on the next render
      }, delayAfterDelete);
    }
    
    return () => clearTimeout(timeout);
  }, [text, isDeleting, loopNum]);
  
  // Split the text to style the "OS" part differently
  const regularPart = text.length <= 7 ? text : text.slice(0, 7); // "Daycare"
  const coloredPart = text.length <= 7 ? '' : text.slice(7);    // "OS" (if typed)
  
  return (
    <>
      <span>{regularPart}</span>
      <span style={{ color: "#2563eb" }}>{coloredPart}</span>
      <span className="cursor">|</span>
    </>
  );
};

const Home = ({ onNavigate }) => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Smart Communication",
      description: "Collaborate with other admins using a simple join code"
    },
    {
      title: "Attendance Tracking",
      description: "Real-time check-in/out with digital records"
    },
    {
      title: "Simplified Billing",
      description: "Automated spreadsheets for detailed monthly reports"
    }
  ];

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
    <div className="home-container">
      <div className="App">
        {/* Background decorative elements */}
        <div className="decorative-element yellow-blob"></div>
        <div className="decorative-element blue-blob"></div>
        <div className="decorative-element pink-blob"></div>
      
        <div className="header-buttons">
          <SignInBtn onClick={handleSignInClick} />
          <ContactUsBtn onClick={handleContactClick} />
        </div>
        
        <div className="main-content">
          <h1 className="main-heading">
            <TypewriterWithStyledParts />
          </h1>
          <p className="sub-heading" style={{ marginBottom: '12px' }}>Streamline communication, attendance tracking, and billing,</p>
          <p className="sub-heading">giving you more time to focus on what matters most <span style={{ color: "#2563eb", fontWeight: "600" }}>—the children</span></p>
          
          {/* Feature cards */}
          <div className="feature-cards-container">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
          
          {/* Trusted by section */}
          <div className="trusted-by">
            <p>Trusted by daycares across the Bay Area</p>
            <div className="indicator-dots">
              <div className="dot blue"></div>
              <div className="dot purple"></div>
              <div className="dot pink"></div>
            </div>
          </div>
        </div>
      </div>
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/daycare/:id" element={<DaycareDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

