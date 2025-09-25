import { useState } from "react";
import { askQuestion } from "../../api/pollApi";

export default function AskQuestion({ pollId }) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const handleQuestionSubmit = async () => {
    const question = { text, options, correctAnswerIndex: correctIndex, timeLimitSec: 60 };
    const res = await askQuestion(pollId, question);
    alert("Question Asked!");
  };

  const updateOption = (idx, val) => {
    const newOptions = [...options];
    newOptions[idx] = val;
    setOptions(newOptions);
  };

  return (
    <div>
      <h3>Ask Question</h3>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Question Text" />
      {options.map((opt, i) => (
        <input key={i} value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
      ))}
      <button onClick={() => setOptions([...options, ""])}>Add Option</button>
      <input type="number" min={0} max={options.length - 1} value={correctIndex} onChange={(e) => setCorrectIndex(Number(e.target.value))} />
      <button onClick={handleQuestionSubmit}>Ask</button>
    </div>
  );
}
