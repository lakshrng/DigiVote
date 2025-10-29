import React, { useState } from "react";
import "./Vote.css";

export default function Vote() {
  const [hasVoted, setHasVoted] = useState(false);

  const candidates = [
    {
      id: 1,
      name: "Candidate A",
      party: "Future Vision Party",
      manifesto:
        "Focus on education reforms, technology adoption, and youth empowerment.",
      image: "https://via.placeholder.com/80x80?text=A",
    },
    {
      id: 2,
      name: "Candidate B",
      party: "People’s Unity Front",
      manifesto:
        "Promotes social equality, better healthcare, and rural development.",
      image: "https://via.placeholder.com/80x80?text=B",
    },
    {
      id: 3,
      name: "Candidate C",
      party: "Progress Alliance",
      manifesto:
        "Supports green energy, innovation, and sustainable economic growth.",
      image: "https://via.placeholder.com/80x80?text=C",
    },
  ];

  const handleVote = () => {
    setHasVoted(true);
  };

  return (
    <div className="vote-page">
      <h2 className="vote-heading">Cast Your Vote</h2>

      <div className={`candidates-section ${hasVoted ? "disabled" : ""}`}>
        {candidates.map((candidate) => (
          <div key={candidate.id} className="manifesto-card">
            <img
              src={candidate.image}
              alt={candidate.name}
              className="cand-img"
            />

            <div className="cand-info">
              <h3>{candidate.name}</h3>
              <p className="party-name">{candidate.party}</p>
              <p className="manifesto-text">{candidate.manifesto}</p>
            </div>

            <button
              className="vote-btn"
              onClick={handleVote}
              disabled={hasVoted}
            >
              {hasVoted ? "Vote Casted ✅" : "Vote"}
            </button>
          </div>
        ))}
      </div>

      {hasVoted && (
        <p className="thankyou">
          🗳️ Your vote has been successfully cast.  
          Thank you for participating in DigiVote!
        </p>
      )}
    </div>
  );
}
