import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = "https://intervue-backend-lltr.onrender.com/api/polls";


function PollHistory() {
  const { pollId } = useParams();
  const containerRef = useRef(null);
  const [pollResults, setPollResults] = useState([]);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollbarHeight = 659;

  useEffect(() => {
    if (!pollId) return;

    const fetchPollHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/${pollId}/history`);
        const history = res.data.data || [];

        // Fetch results for each question
        const withResults = await Promise.all(
          history.map(async (q) => {
            try {
              const resultRes = await axios.get(
                `${API_URL}/${pollId}/results/${q.questionId}`
              );
              const result = resultRes.data.data;

              return {
                question: q.text,
                correctAnswerIndex: result.correctAnswerIndex,
                totalAnswers: result.totalAnswers,
                totalParticipants: result.totalParticipants,
                answers: result.options.map((option, i) => ({
                  option,
                  count: result.counts[i] || 0,
                  percentage:
                    result.totalAnswers > 0
                      ? Math.round((result.counts[i] / result.totalAnswers) * 100)
                      : 0,
                })),
              };
            } catch (err) {
              console.error("Error fetching results for question:", q.questionId, err);
              return {
                question: q.text,
                correctAnswerIndex: -1,
                totalAnswers: 0,
                totalParticipants: 0,
                answers: q.options.map((option) => ({
                  option,
                  count: 0,
                  percentage: 0,
                })),
              };
            }
          })
        );

        setPollResults(withResults);
      } catch (err) {
        console.error("Error fetching poll history:", err);
      }
    };

    fetchPollHistory();
  }, [pollId]);

  // Scroll tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => setScrollTop(container.scrollTop);
    setScrollHeight(container.scrollHeight - container.clientHeight);

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [pollResults]);

  const thumbHeight =
    containerRef.current && containerRef.current.scrollHeight > 0
      ? Math.max(
          (containerRef.current.clientHeight /
            containerRef.current.scrollHeight) *
            scrollbarHeight,
          30
        )
      : 30;

  const thumbTop =
    containerRef.current && scrollHeight > 0
      ? (scrollTop / scrollHeight) * (scrollbarHeight - thumbHeight)
      : 0;

  return (
    <div className="relative w-[1440px] h-[923px] bg-white mx-auto">
      <h1 className="absolute w-[345px] h-[50px] left-[335px] top-[77px] text-center text-[40px] font-normal text-black">
        View Poll History
      </h1>

      <div
        ref={containerRef}
        className="absolute top-[172px] left-[335px] w-[727px] h-[659px] overflow-y-scroll pr-4"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="pr-2">
          {pollResults.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              No poll history found.
            </p>
          ) : (
            pollResults.map((poll, idx) => (
              <div
                key={idx}
                className="mb-12 flex flex-col gap-[14px] border border-[#AF8FF1] rounded-[9px] p-0"
              >
                {/* Question Header */}
                <div className="flex flex-col justify-center items-start pl-4 w-full h-[50px] bg-gradient-to-r from-[#343434] to-[#6E6E6E] rounded-t-[10px]">
                  <span className="text-[17px] font-semibold text-white">
                    {poll.question}
                  </span>
                </div>

                {/* Answers */}
                <div className="flex flex-col gap-[15px] p-[18px_16px]">
                  {poll.answers.map((ans, i) => (
                    <div
                      key={i}
                      className={`relative flex items-center gap-[10px] p-[26px_21px] w-[678px] h-[55px] border rounded-[6px] ${
                        i === poll.correctAnswerIndex
                          ? "border-green-500 bg-green-100"
                          : "border-[#8F64E1] bg-gray-100"
                      }`}
                    >
                      {/* Progress bar */}
                      <div
                        className={`absolute top-0 left-0 h-full rounded-[6px] ${
                          i === poll.correctAnswerIndex ? "bg-green-400" : "bg-[#6766D5]"
                        }`}
                        style={{ width: `${ans.percentage}%`, zIndex: 0 }}
                      ></div>

                      {/* Circle number */}
                      <div className="relative z-10 flex justify-center items-center w-[24px] h-[24px] bg-white rounded-full">
                        <span
                          className={`text-[11px] font-semibold ${
                            i === poll.correctAnswerIndex ? "text-green-600" : "text-[#6766D5]"
                          }`}
                        >
                          {i + 1}
                        </span>
                      </div>

                      {/* Option text */}
                      <span
                        className={`z-10 font-semibold ${
                          i === poll.correctAnswerIndex ? "text-green-700" : "text-white"
                        }`}
                      >
                        {ans.option}
                      </span>

                      {/* Percentage + count */}
                      <span className="absolute right-2 z-10 font-semibold text-black">
                        {ans.percentage}% 
                      </span>
                    </div>
                  ))}

                  
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom scrollbar */}
      <div className="absolute w-[9px] h-[659px] left-[1399px] top-[172px] bg-gray-300 rounded">
        <div
          className="w-[9px] bg-[#828282] rounded"
          style={{ height: thumbHeight, transform: `translateY(${thumbTop}px)` }}
        ></div>
      </div>
    </div>
  );
}

export default PollHistory;
