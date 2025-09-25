import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function StudentHome() {
  const [name, setName] = useState("");
  const [pollId, setPollId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!name.trim()) return alert("Please enter your name");
    if (!pollId.trim()) return alert("Please enter the Poll ID");

    const studentId = uuidv4();
    setLoading(true);

    try {
      const res = await fetch("https://intervue-backend-lltr.onrender.com/api/polls/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, name, studentId }),
      });

      if (!res.ok) throw new Error("Failed to join poll");

      localStorage.setItem("studentName", name);
      localStorage.setItem("pollId", pollId);
      localStorage.setItem("studentId", studentId);

      navigate("/student/poll", { state: { name, pollId, studentId } });
    } catch (err) {
      console.error(err);
      alert("Failed to join poll. Check Poll ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-[1440px] min-h-screen bg-white"
      style={{ fontFamily: "Sora" }}
    >
      {/* Intervue Poll Badge */}
      <div
        className="absolute flex items-center justify-center gap-2"
        style={{
          width: "134px",
          height: "31px",
          left: "50%",
          top: "20%",
          transform: "translateX(-50%)",
          background: "linear-gradient(90deg, #7565D9 0%, #4D0ACD 100%)",
          borderRadius: "24px",
          padding: "0 9px",
        }}
      >
        <div
          style={{
            width: "14.66px",
            height: "14.65px",
            background: "#FFFFFF",
            borderRadius: "50%",
          }}
        />
        <span
          style={{
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "18px",
            color: "#FFFFFF",
          }}
        >
          Intervue Poll
        </span>
      </div>

      {/* Heading */}
      <h1
        className="absolute text-center"
        style={{
          width: "737px",
          height: "50px",
          left: "50%",
          top: "30%",
          transform: "translateX(-50%)",
          fontWeight: 400,
          fontSize: "40px",
          lineHeight: "50px",
          color: "#000000",
        }}
      >
        Let’s Get Started
      </h1>

      {/* Subtitle */}
      <p
        className="absolute text-center"
        style={{
          width: "762px",
          left: "50%",
          top: "40%",
          transform: "translateX(-50%)",
          fontWeight: 400,
          fontSize: "19px",
          lineHeight: "25px",
          
        }}
      >
        If you’re a student, you’ll be able to <span className="font-bold">submit your answers</span>, participate
        in live<br/> polls, and see how your responses compare with your classmates
      </p>

      {/* Form Container */}
      <div
        className="absolute flex flex-col gap-6"
        style={{
          width: "507px",
          left: "50%",
          top: "52%",
          transform: "translateX(-50%)",
        }}
      >
        {/* Name Input */}
        <div className="flex flex-col relative">
          <label
            style={{
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "23px",
              color: "#000000",
              marginBottom: "8px",
            }}
          >
            Enter your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rahul Bajaj"
            className="w-full h-14 bg-[#F2F2F2] rounded px-4 text-black placeholder-gray-500"
          />
        </div>

        {/* Poll ID Input */}
        <div className="flex flex-col relative">
          <label
            style={{
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "23px",
              color: "#000000",
              marginBottom: "8px",
            }}
          >
            Enter Poll ID
          </label>
          <input
            type="text"
            value={pollId}
            onChange={(e) => setPollId(e.target.value)}
            placeholder="Enter Poll ID"
            className="w-full h-14 bg-[#F2F2F2] rounded px-4 text-black placeholder-gray-500"
          />
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={loading}
          style={{
            width: "233.93px",
            height: "57.58px",
            background:
              "linear-gradient(99.18deg, #8F64E1 -46.89%, #1D68BD 223.45%)",
            borderRadius: "34px",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "23px",
            color: "#FFFFFF",
            alignSelf: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: loading ? "none" : "auto",
            opacity: loading ? 0.5 : 1,
            marginTop: "40px",
          }}
        >
          {loading ? "Joining..." : "Continue"}
        </button>
      </div>
    </div>
  );
}

export default StudentHome;
