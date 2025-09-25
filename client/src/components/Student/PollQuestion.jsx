import { useEffect, useState } from "react";
import { socket } from "../../socket";

export default function PollQuestion({ pollId, student }) {
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    // Join poll room
    socket.emit("join", { pollId, studentId: student.studentId, name: student.name });

    // Listen for new question
    socket.on("question:asked", (q) => {
      setQuestion(q);
      setSelected(null);
      setSubmitted(false);
      setEnded(false);
    });

    // Listen for question end
    socket.on("question:ended", (q) => {
      setQuestion(q);
      setEnded(true);
    });

    return () => {
      socket.off("question:asked");
      socket.off("question:ended");
    };
  }, [pollId]);

  const handleSubmit = () => {
    socket.emit("submit:answer", { pollId, studentName: student.name, answerIndex: selected });
    setSubmitted(true);
  };

  if (!question) return <div>Waiting for teacher...</div>;

  return (
    <div>
      <h4>{question.text}</h4>
      {question.options.map((opt, i) => (
        <div key={i}>
          <input
            type="radio"
            name="option"
            value={i}
            onChange={() => setSelected(i)}
            disabled={submitted || ended}
          /> {opt}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={submitted || selected === null || ended}>
        Submit
      </button>
      {ended && <div>Question ended. Correct Answer: {question.options[question.correctAnswerIndex]}</div>}
    </div>
  );
}
