import React from "react";
import "./Results.css";

export default function Results() {
  // Example candidate data
  const candidate1 = {
    name: "Candidate A",
    image: "/images/candidateA.jpg", // place images inside /public/images/
    votes: 152,
    manifesto:
      "Improve digital infrastructure, introduce smart classrooms, and enhance student communication systems.",
  };
  const candidate2 = {
    name: "Candidate B",
    image: "/images/candidateB.jpg",
    votes: 127,
    manifesto:
      "Focus on eco-friendly campus initiatives, cultural events, and better placement training.",
  };
  const candidate3 = {
    name: "Candidate C",
    image: "/images/candidateC.jpg",
    votes: 98,
    manifesto:
      "Prioritize mental health programs, skill workshops, and inclusive student activities.",
  };
  const candidate4 = {
    name: "Candidate D",
    image: "/images/candidateD.jpg",
    votes: 73,
    manifesto:
      "Develop better hostel facilities, expand sports infrastructure, and improve cafeteria quality.",
  };

  const results = [candidate1, candidate2, candidate3, candidate4];
  const totalVotes = results.reduce((sum, c) => sum + c.votes, 0);

  return (
    <div className="results-container">
      <h2 className="results-title">Election Results & Manifestos</h2>

      <div className="results-list">
        {results.map((c, index) => {
          const percentage = ((c.votes / totalVotes) * 100).toFixed(1);
          const isWinner = c.votes === Math.max(...results.map((r) => r.votes));

          return (
            <div
              key={index}
              className={`result-item ${isWinner ? "winner" : ""}`}
            >
              <div className="candidate-header">
                <div className="candidate-left">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="candidate-image"
                  />
                  <div className="candidate-details">
                    <span className="candidate-name">{c.name}</span>
                    <span className="vote-count">{c.votes} votes</span>
                  </div>
                </div>
                <span className="percentage">{percentage}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="manifesto">{c.manifesto}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
