import { useEffect, useState } from "react";
import { socket } from "../../socket";

export default function LiveResults({ pollId }) {
  const [answers, setAnswers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [endedQuestion, setEndedQuestion] = useState(null);

  useEffect(() => {
    // Live answers
    socket.on("question:progress", (answers) => {
      setAnswers(answers);
    });

    // Participants update
    socket.on("participants:updated", (list) => {
      setParticipants(list);
    });

    // Question ended
    socket.on("question:ended", (q) => {
      setEndedQuestion(q);
    });

    return () => {
      socket.off("question:progress");
      socket.off("participants:updated");
      socket.off("question:ended");
    };
  }, []);

  return (
    <div>
      <h3>Live Results</h3>
      {answers.map((a, i) => (
        <div key={i}>{a.studentName}: Option {a.answerIndex + 1}</div>
      ))}
      <div>Total Participants: {participants.length}</div>

      {endedQuestion && (
        <div>
          <h4>Question Ended</h4>
          Correct Answer: {endedQuestion.options[endedQuestion.correctAnswerIndex]}
        </div>
      )}
    </div>
  );
}
