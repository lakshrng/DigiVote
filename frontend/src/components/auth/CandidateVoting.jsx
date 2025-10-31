import React, { useEffect, useState } from "react";

const CandidateVoting = () => {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Fetch candidates from backend
  useEffect(() => {
    fetch("/api/voting/candidates")
      .then(res => res.json())
      .then(data => setCandidates(data))
      .catch(err => console.error("Error fetching candidates:", err));
  }, []);

  const handleVote = () => {
    if (selected) {
      console.log(`Voted for candidate ID: ${selected}`);
      setSubmitted(true);
      // TODO: POST vote to backend
    } else {
      alert("Please select a candidate before submitting!");
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100vh",
      background: "linear-gradient(135deg, #1b263b, #415a77)",
      color: "#fff", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      textAlign: "center", padding: "20px"
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px", textShadow: "2px 2px 10px rgba(0,0,0,0.4)" }}>
        Candidate Voting
      </h1>

      {!submitted ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "300px" }}>
          {candidates.map(candidate => (
            <label
              key={candidate.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderRadius: "12px",
                background: selected === candidate.id ? "#4a90e2" : "#2c3e50",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              <span>{candidate.name} ({candidate.position})</span>
              <input
                type="radio"
                name="candidate"
                value={candidate.id}
                checked={selected === candidate.id}
                onChange={() => setSelected(candidate.id)}
              />
            </label>
          ))}

          <button
            onClick={handleVote}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: "#32cd32",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Submit Vote
          </button>
        </div>
      ) : (
        <div style={{ marginTop: "40px", fontSize: "1.5rem" }}>
          ✅ Thank you for voting!
        </div>
      )}
    </div>
  );
};

export default CandidateVoting;
