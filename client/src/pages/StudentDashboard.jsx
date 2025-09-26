import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function StudentDashboard() {
  const location = useLocation();
  const { name, pollId, studentId } = location.state || {};

  const [question, setQuestion] = useState(null);
  const [questionId, setQuestionId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [waiting, setWaiting] = useState(true); // Track waiting state

  // Fetch active question periodically
  useEffect(() => {
    if (!pollId) return;

    const fetchQuestion = async () => {
      try {
        const res = await axios.get(
          `https://intervue-backend-lltr.onrender.com/api/polls/${pollId}`
        );
        const active = res.data.data.activeQuestion;

        if (active && active._id !== questionId) {
          setQuestion(active);
          setQuestionId(active._id);
          setSelectedIndex(null);
          setSubmitted(false);
          setResults(null);

          const now = new Date();
          const startedAt = new Date(active.startedAt);
          const remaining = Math.max(
            0,
            Math.ceil(
              (startedAt.getTime() + active.timeLimitSec * 1000 - now.getTime()) / 1000
            )
          );
          setTimeLeft(remaining);
          setWaiting(false);

          if (remaining === 0) fetchLiveResults();
        }

        if (active && active.ended && !results) {
          fetchLiveResults();
          setWaiting(false);
        }

        if (!active) {
          setQuestion(null);
          setQuestionId(null);
          setTimeLeft(0);
          setSelectedIndex(null);
          setSubmitted(false);
          setResults(null);
          setWaiting(true); // Show waiting message when no active question
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuestion();
    const interval = setInterval(fetchQuestion, 2000);
    return () => clearInterval(interval);
  }, [pollId, questionId, results]);

  // Countdown timer
  useEffect(() => {
    if (!question || timeLeft <= 0) return;

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
  }, [question, timeLeft]);

  // Submit answer
  const submitAnswer = async () => {
    if (selectedIndex === null || submitted || timeLeft === 0) return;
    try {
      await axios.post(
        "https://intervue-backend-lltr.onrender.com/api/polls/submit-answer",
        {
          pollId,
          studentName: name,
          answerIndex: selectedIndex,
        }
      );
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit answer:", err);
      alert(err.response?.data?.message || "Error submitting answer");
    }
  };

  // Fetch live results
  const fetchLiveResults = async () => {
    try {
      const res = await axios.get(
        `https://intervue-backend-lltr.onrender.com/api/polls/${pollId}/live-result`
      );
      setResults(res.data.data);
      setWaiting(false);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    }
  };

  const options = question?.options || results?.options || [];
  const counts = results?.counts || Array(options.length).fill(0);
  const totalAnswers = results?.totalAnswers || 0;
  const totalParticipants = results?.totalParticipants || 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 gap-4">
      {/* Waiting message */}
      {waiting && (
        <div className="text-3xl font-semibold text-center">
          Wait for the teacher to ask a question...
        </div>
      )}

      {/* Question / Results Card */}
      {!waiting && (
        <div className="w-full max-w-xl border rounded-lg p-4 flex flex-col gap-4">
          {/* Question Header */}
          <div className="flex justify-between items-center bg-gray-800 text-white font-semibold p-2 rounded">
            <span>{question?.text || results?.question}</span>
            <span
              className={`font-bold ${
                timeLeft <= 10 && timeLeft > 0 ? "text-red-500" : "text-yellow-300"
              }`}
            >
              {timeLeft > 0 ? `${timeLeft}s` : "Time's up"}
            </span>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3 mt-2">
            {options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = results && idx === results.correctAnswerIndex;
              const percentage =
                totalAnswers > 0 ? Math.round((counts[idx] / totalAnswers) * 100) : 0;

              return (
                <div
                  key={idx}
                  className={`relative w-full h-12 border rounded-lg overflow-hidden flex items-center justify-between px-4 cursor-pointer
                    ${!results && isSelected ? "bg-blue-200 border-blue-500" : "bg-gray-100"}
                    ${results && isCorrect ? "bg-green-200" : ""}`}
                  onClick={() => !submitted && !results && setSelectedIndex(idx)}
                >
                  {/* Percentage bar */}
                  {results && (
                    <div
                      className={`absolute top-0 left-0 h-full ${
                        isCorrect ? "bg-green-400" : "bg-purple-500"
                      } opacity-50`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <span className="relative z-10">{opt}</span>
                  {results && (
                    <span className="relative z-10">
                      {percentage}% ({counts[idx]})
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          {!submitted && selectedIndex !== null && !results && timeLeft > 0 && (
            <button
              onClick={submitAnswer}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Submit Answer
            </button>
          )}

          {/* Results info */}
          {results && (
            <span className="text-sm text-gray-600 mt-2">
              Answers: {totalAnswers} / {totalParticipants} participants
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
