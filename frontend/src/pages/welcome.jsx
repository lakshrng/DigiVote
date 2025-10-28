import React from "react";
import "./welcome.css";

export default function Welcome() {
  return (
    <div className="welcome-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to DigiVote</h1>
          <p className="hero-subtitle">
            Secure, transparent, and easy online voting for everyone.
          </p>
          <button className="get-started">Get Started</button>
        </div>
      </div>
    </div>
  );
}
