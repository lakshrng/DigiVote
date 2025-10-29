import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div className="logo">DigiVote</div>

        <ul className="nav-links">
          <li><a href="#" className="nav-link">Home</a></li>
          <li><a href="#" className="nav-link">Vote</a></li>
          <li><a href="#" className="nav-link">Results</a></li>
          <li><a href="#" className="nav-link">Profile</a></li>
        </ul>
      </div>
    </nav>
  );
}
