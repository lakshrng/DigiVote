import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

// Import all your pages
import Home from "./pages/Home";
import Results from "./pages/Results";
import Candidates from "./pages/Candidates";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Vote from "./pages/Vote";
import VoterPage from "./pages/VoterPage";
import Welcome from "./pages/Welcome"; // make sure 'Welcome.jsx' filename matches case

export default function App() {
  return (
    <Router>
      {/* Navbar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          backgroundColor: "#1e1e2f",
          padding: "15px 0",
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { path: "/welcome", label: "Welcome" },
            { path: "/login", label: "Login" },
            { path: "/home", label: "Home" },
            { path: "/candidates", label: "Candidates" },
            { path: "/results", label: "Results" },
            { path: "/profile", label: "Profile" },
            { path: "/vote", label: "Vote" },
            { path: "/voterpage", label: "Voter Page" },
            { path: "/about", label: "About" },
            { path: "/contact", label: "Contact" },
          ].map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                color: isActive ? "#00d8ff" : "white",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "color 0.3s",
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main style={{ marginTop: "90px", padding: "20px" }}>
        <Routes>
          {/* Default route — Welcome first */}
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/results" element={<Results />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/voterpage" element={<VoterPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </Router>
  );
}
