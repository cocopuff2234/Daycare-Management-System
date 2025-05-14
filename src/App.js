import React, { Component } from 'react'; // Ensure React is imported
import './App.css';
import SignUpButton from './SignUpButton'; 
import { Typewriter } from 'react-simple-typewriter';

class App extends Component {
  constructor(props) {
    super(props);
  }

  handleSignUpClick = () => {
    console.log("Sign Up button clicked");
  };

  render() {
    return (
      <div className="App">
        <h1>
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
        <p>Childcare made simple.</p>
        <SignUpButton onClick={this.handleSignUpClick} /> {/* Ensure this is correctly passed */}
      </div>
    );
  }
}

export default App;

