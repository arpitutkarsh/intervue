import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getPollById, askQuestion } from "../api/pollApi";
import axios from "axios";

function TeacherDashboard() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { teacherName, pollName } = location.state || {};

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);

  const [showParticipantsModal, setShowParticipantsModal] = useState(false);

  const [isCopied, setIsCopied] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // Update window height on resize
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch poll on mount
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await getPollById(id);
        const pollData = res.data.data;
        setPoll(pollData);

        // Set active question and calculate remaining time
        const active = pollData.activeQuestion;
        if (active && !active.ended) {
          setActiveQuestion(active);
          const now = new Date();
          const startedAt = new Date(active.startedAt);
          const remaining = Math.max(
            0,
            Math.ceil(
              (startedAt.getTime() + active.timeLimitSec * 1000 - now.getTime()) / 1000
            )
          );
          setTimeLeft(remaining);
        }
      } catch (err) {
        console.error("Error fetching poll:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || !activeQuestion) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchLiveResults();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, activeQuestion]);

  // Options handlers
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctIndex >= newOptions.length) setCorrectIndex(0);
  };

  // Ask question
  const handleAskQuestion = async () => {
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!questionText.trim() || cleanOptions.length < 2) {
      alert("Enter a question and at least 2 options");
      return;
    }

    const correctIdx = Math.min(correctIndex, cleanOptions.length - 1);

    try {
      setSubmitting(true);
      await askQuestion(id, {
        text: questionText.trim(),
        options: cleanOptions,
        correctAnswerIndex: correctIdx,
        timeLimitSec: Number(timeLimit),
      });

      setActiveQuestion({
        text: questionText.trim(),
        options: cleanOptions,
        correctAnswerIndex: correctIdx,
        timeLimitSec: Number(timeLimit),
        startedAt: new Date().toISOString(),
      });
      setTimeLeft(Number(timeLimit));
      setResults(null);

      setQuestionText("");
      setOptions(["", ""]);
      setCorrectIndex(0);
      setTimeLimit(20);
    } catch (err) {
      console.error("Ask question failed:", err.response?.data || err);
      alert("Failed to add question ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch live results
  const fetchLiveResults = async () => {
    try {
      const res = await axios.get(
        `https://intervue-backend-lltr.onrender.com/api/polls/${id}/live-result`
      );
      setResults(res.data.data);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    }
  };

  // Participants modal
  const openParticipantsModal = () => setShowParticipantsModal(true);
  const closeParticipantsModal = () => setShowParticipantsModal(false);

  const handleCopyPollId = async () => {
    try {
      await navigator.clipboard.writeText(poll._id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading poll...</p>;
  if (!poll) return <p className="text-center mt-10">Poll not found ❌</p>;

  const displayOptions = activeQuestion?.options || [];
  const participants = poll.participants || [];

  return (
    <div className="w-screen h-screen relative p-6 bg-gray-50">
      {/* Intervue Poll Badge */}
      {!activeQuestion && (
        <div className="absolute top-6 left-6 ml-5 flex items-center gap-2 w-[134px] h-[31px] bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] rounded-[24px] px-2 py-0">
          <div className="w-[14.66px] h-[14.65px] bg-white rounded-full"></div>
          <span className="text-white font-sora font-semibold text-[14px] leading-[18px]">
            Intervue Poll
          </span>
        </div>
      )}

      {/* Header */}
      {!activeQuestion && (
        <>
          <h2 className="text-4xl mt-8 ml-5">
            Let's <span className="font-bold">Get Started</span>
          </h2>
          <p className="mb-6 ml-5">
            you’ll have the ability to create and manage polls, ask questions, and
            monitor your students' responses in real-time.
          </p>
        </>
      )}

      {/* View Poll History */}
      <button
        onClick={() =>
          navigate(`/poll-history/${id}`, { state: { pollName } })
        }
        className="absolute top-6 right-6 bg-purple-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-purple-700"
      >
        View Poll History
      </button>

      {/* Active Question */}
      {activeQuestion && (
        <div className="w-full max-w-full h-[60vh] border border-purple-300 rounded-lg p-4 flex flex-col gap-4 relative mt-15 overflow-auto">
          <div className="flex justify-between items-center bg-gray-800 text-white font-semibold p-2 rounded-t">
            <span>{activeQuestion.text}</span>
            <span
              className={`font-bold ${timeLeft <= 10 ? "text-red-500" : "text-yellow-300"
                }`}
            >
              {timeLeft > 0 ? `${timeLeft}s` : "Time's up"}
            </span>
          </div>

          <div className="flex flex-col gap-3 mt-2 overflow-auto">
            {displayOptions.map((opt, idx) => {
              const isCorrect = results && idx === results.correctAnswerIndex;
              const percentage = results?.totalAnswers
                ? Math.round((results.counts[idx] / results.totalAnswers) * 100)
                : 0;

              return (
                <div
                  key={idx}
                  className="relative flex items-center gap-3 p-4 rounded border bg-gray-100"
                >
                  {results && (
                    <div
                      className={`absolute top-0 left-0 h-full ${isCorrect ? "bg-green-400" : "bg-purple-500"
                        } opacity-50 rounded-l`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  <div className="w-6 h-6 bg-gray-500 text-white flex items-center justify-center rounded-full z-10">
                    {idx + 1}
                  </div>
                  <span className="z-10">{opt}</span>

                  {results && (
                    <span className="absolute right-2 font-semibold z-10">
                      {percentage}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ask New Question Button */}
      {timeLeft === 0 && results && (
        <button
          onClick={() => {
            setActiveQuestion(null);
            setResults(null);
          }}
          className="mt-4 bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
        >
          Ask a New Question
        </button>
      )}

      {/* Ask Question Form */}
      {!activeQuestion && (
        <div className="mt-6 p-4 bg-gray-50 w-full max-w-full">
          {/* Question Heading + Timer Dropdown */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Enter your question</h2>

            <div className="flex items-center gap-2 mr-65">
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="pl-5 bg-gray-400 p-2 rounded"
              >
                {Array.from({ length: 6 }, (_, i) => (i + 1) * 10).map(
                  (sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Question Textarea */}
          <div
            className="relative w-full mb-4"
            style={{ minHeight: 200, maxHeight: 50 }}
          >
            <textarea
              placeholder="Enter your question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-300 h-50 p-4 bg-gray-300 resize-none rounded"
              maxLength={100}
            />
            <span className="absolute bottom-2 right-4 mr-65 text-sm text-gray-600">
              {questionText.length}/100
            </span>
          </div>

          <p className="mb-2">Edit Options</p>

          {/* Options */}
          <div className="mb-3">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-4 mb-2">
                <input
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  className="bg-gray-300 w-1/2 p-2 rounded"
                />

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctIndex === i}
                      onChange={() => setCorrectIndex(i)}
                      className="accent-purple-700"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={correctIndex !== i}
                      readOnly
                      className="accent-gray-400"
                    />
                    No
                  </label>
                </div>

                <button
                  onClick={() => removeOption(i)}
                  disabled={options.length <= 2}
                  className="text-red-600 font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-purple-700 font-semibold border-2 border-purple-700 px-2 py-1 rounded-lg"
            >
              + Add more Option
            </button>
          </div>
          <hr className="mt-5 mb-3" />
          {/* Submit */}
          <button
            onClick={handleAskQuestion}
            disabled={submitting}
            className="bg-purple-700 text-white py-3 px-2 ml-330 bg-gradient-to-l from-purple-800 to-blue-800 rounded-full hover:bg-purple-800 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Ask Question"}
          </button>
        </div>
      )}

      {/* Floating participants button */}
      <div
        onClick={openParticipantsModal}
        className="fixed bottom-10 right-10 mb-12 flex flex-row items-center justify-center  gap-2 w-[80px] h-[76px] bg-purple-700 rounded-lg cursor-pointer shadow-lg z-50"
      >
        <span className="text-white font-bold text-center text-sm">
          Participant
        </span>
      </div>

      {/* Participants modal */}
      {showParticipantsModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex items-center justify-center z-50">
          <div
            className="relative bg-white border border-[#CECECE] rounded-md shadow-lg"
            style={{ width: "429px", height: "477px" }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">Participants</h3>
              <button onClick={closeParticipantsModal} className="text-gray-500">
                X
              </button>
            </div>

            {/* Modal Content */}
            {/* Show Participants Button ONLY when question is active and timer is 0 */}
{activeQuestion && timeLeft === 0 && (
  <div
    onClick={openParticipantsModal}
    className="fixed bottom-10 right-10 flex flex-row items-center justify-center p-[19px_20px_14px] gap-2 w-[80px] h-[76px] bg-purple-700 rounded-lg cursor-pointer shadow-lg z-50"
  >
    <span className="text-white font-bold text-center text-sm">
      Participants
    </span>
  </div>
)}

{/* Participants Modal */}
{showParticipantsModal && activeQuestion && timeLeft === 0 && (
  <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex items-center justify-center z-50">
    <div
      className="relative bg-white border border-[#CECECE] rounded-md shadow-lg"
      style={{ width: "429px", height: "477px" }}
    >
      {/* Modal Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-lg">Participants</h3>
        <button onClick={closeParticipantsModal} className="text-gray-500">
          X
        </button>
      </div>

      {/* Modal Content */}
      <div className="p-4 overflow-auto h-[calc(100%-64px)]">
        {participants.length > 0 ? (
          <ul className="space-y-2">
            {participants.map((p, idx) => (
              <li key={idx} className="border-b pb-2">
                {p.name || p.studentId || `Student ${idx + 1}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No participants yet.</p>
        )}
      </div>
    </div>
  </div>
)}


          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
