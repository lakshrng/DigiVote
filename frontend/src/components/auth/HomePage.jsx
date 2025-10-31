// src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const buttonStyle = (bgGradient) => ({
    padding: "16px 36px",
    background: bgGradient,
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  });

  const hoverEffect = (e) => {
    e.currentTarget.style.transform = "scale(1.08)";
    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.35)";
  };

  const hoverOutEffect = (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #1b263b, #415a77)",
      color: "#fff",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      textAlign: "center",
      padding: "20px"
    }}>
      <h1 style={{
        fontSize: "3rem",
        fontWeight: "bold",
        marginBottom: "15px",
        textShadow: "2px 2px 12px rgba(0,0,0,0.4)"
      }}>
        Welcome to DigiVote
      </h1>
      <p style={{
        fontSize: "1.2rem",
        marginBottom: "50px",
        textShadow: "1px 1px 6px rgba(0,0,0,0.3)"
      }}>
        Select an option below:
      </p>

      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/voting")}
          style={buttonStyle("linear-gradient(135deg, #4a90e2, #357ABD)")}
          onMouseOver={hoverEffect}
          onMouseOut={hoverOutEffect}
        >
          Candidate Voting
        </button>

        <button
          onClick={() => navigate("/apply")}
          style={buttonStyle("linear-gradient(135deg, #2d9c71, #1f7a5f)")}
          onMouseOver={hoverEffect}
          onMouseOut={hoverOutEffect}
        >
          Candidate Apply
        </button>

        <button
          onClick={() => navigate("/results")}
          style={buttonStyle("linear-gradient(135deg, #6c757d, #495057)")}
          onMouseOver={hoverEffect}
          onMouseOut={hoverOutEffect}
        >
          View Results
        </button>
      </div>
    </div>
  );
};

export default HomePage;
