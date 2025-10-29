import { useEffect, useState } from "react";
import "./Candidates.css";

export default function Candidates() {
  const [electionId, setElectionId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    student_id: "",
    position_id: "",
    election_id: "",
    platform_statement: "",
    photo_url: ""
  });

  // Fetch candidates by election
  const fetchCandidates = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/candidates/election/${id}`);
      if (!res.ok) throw new Error("Failed to fetch candidates");
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle apply form submit
  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/candidates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application failed");
      alert(data.message);
      fetchCandidates(form.election_id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="candidates-page">
      <h2>🎓 Candidate Portal</h2>

      {/* Candidate Application Form */}
      <form className="candidate-form" onSubmit={handleApply}>
        <h3>Apply for a Position</h3>
        <input
          type="text"
          name="student_id"
          placeholder="Student ID"
          value={form.student_id}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="position_id"
          placeholder="Position ID"
          value={form.position_id}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="election_id"
          placeholder="Election ID"
          value={form.election_id}
          onChange={handleChange}
          required
        />
        <textarea
          name="platform_statement"
          placeholder="Your platform statement"
          value={form.platform_statement}
          onChange={handleChange}
        />
        <input
          type="text"
          name="photo_url"
          placeholder="Photo URL (optional)"
          value={form.photo_url}
          onChange={handleChange}
        />
        <button type="submit">Apply</button>
      </form>

      {/* Candidate List Section */}
      <div className="candidate-list-section">
        <h3>View Candidates by Election</h3>
        <input
          type="text"
          placeholder="Enter Election ID"
          value={electionId}
          onChange={(e) => setElectionId(e.target.value)}
        />
        <button onClick={() => fetchCandidates(electionId)}>Fetch</button>

        {loading && <p>Loading candidates...</p>}
        {error && <p className="error">{error}</p>}

        {candidates.length > 0 && (
          <ul className="candidate-list">
            {candidates.map((c) => (
              <li key={c.id}>
                <img
                  src={c.photo_url || "https://via.placeholder.com/50"}
                  alt={c.student?.user?.first_name}
                />
                <div>
                  <strong>
                    {c.student?.user?.first_name} {c.student?.user?.last_name}
                  </strong>
                  <p>{c.position?.name}</p>
                  <small>{c.platform_statement}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
