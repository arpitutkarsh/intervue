import { useState } from "react";
import { joinPoll } from "../../api/pollApi";

export default function JoinPoll({ setJoined }) {
  const [name, setName] = useState("");
  const [pollId, setPollId] = useState("");

  const handleJoin = async () => {
    const studentId = Date.now().toString(); // simple unique id
    await joinPoll({ pollId, studentId, name });
    setJoined({ pollId, studentId, name });
  };

  return (
    <div>
      <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Poll ID" value={pollId} onChange={(e) => setPollId(e.target.value)} />
      <button onClick={handleJoin}>Join Poll</button>
    </div>
  );
}
