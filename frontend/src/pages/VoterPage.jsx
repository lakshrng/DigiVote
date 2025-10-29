import { useEffect, useState } from "react";
import "../index.css";

export default function VoterPage() {
  const [voters, setVoters] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchVoters() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/voters");
      if (!res.ok) throw new Error("Failed to load voters");
      const data = await res.json();
      setVoters(data);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVoters();
  }, []);

  async function addVoter(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError("");
    try {
      const res = await fetch("/api/voters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add voter");
      }
      setName("");
      await fetchVoters();
    } catch (e) {
      setError(e.message || "Error");
    }
  }

  return (
    <div className="container">
      <h1>DigiVote</h1>
      <form onSubmit={addVoter} className="row">
        <input
          placeholder="Enter voter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul className="list">
          {voters.map((v) => (
            <li key={v.id}>{v.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
