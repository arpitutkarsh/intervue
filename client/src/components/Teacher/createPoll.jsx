import { useState } from "react";
import { createPoll } from "../../api/pollApi";

export default function CreatePoll() {
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    const res = await createPoll(title);
    alert("Poll Created: " + res.data.data._id);
  };

  return (
    <div>
      <h2>Create Poll</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Poll Title" />
      <button onClick={handleCreate}>Create Poll</button>
    </div>
  );
}
