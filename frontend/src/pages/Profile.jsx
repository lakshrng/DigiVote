import React from "react";
import "./Profile.css";

export default function Profile() {
  const user = {
    name: "Candidate Name",
    voterId: "DVX1024",
    email: "candidate@example.com",
    constituency: "Central City",
    hasVoted: false,
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="avatar">🧑‍💼</div>
        <h2>{user.name}</h2>
        <p className="voter-id">Voter ID: {user.voterId}</p>
        <div className="profile-details">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Constituency:</strong> {user.constituency}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={user.hasVoted ? "voted" : "not-voted"}>
              {user.hasVoted ? "Voted" : "Not Voted Yet"}
            </span>
          </p>
        </div>
        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  );
}
