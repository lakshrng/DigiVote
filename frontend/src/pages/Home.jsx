import React from "react";
import "./Home.css";
import Navbar from "./Navbar"; 

const candidates = [
  {
    id: 1,
    name: "Candidate 1",
    party: "Party A",
    manifesto:
      "Focus on student welfare, better facilities, and transparency in elections.",
    emoji: "🧑‍💼",
  },
  {
    id: 2,
    name: "Candidate 2",
    party: "Party B",
    manifesto:
      "Encouraging innovation, improving academic support, and campus cleanliness.",
    emoji: "👩‍🎓",
  },
  {
    id: 3,
    name: "Candidate 3",
    party: "Party C",
    manifesto:
      "Digital campus initiatives, more cultural events, and eco-friendly actions.",
    emoji: "🧑‍💻",
  },
];

export default function Home() {
  return (
    <div className="home">
      

      <h1>🗳️ Candidate Manifestos</h1>

      <div className="candidate-grid">
        {candidates.map((c) => (
          <div className="candidate-card" key={c.id}>
            <div className="emoji">{c.emoji}</div>
            <h3>{c.name}</h3>
            <p className="party">{c.party}</p>
            <p className="manifesto">{c.manifesto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
