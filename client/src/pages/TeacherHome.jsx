import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPoll } from "../api/pollApi.js";

function TeacherHome() {
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState("");
  const [pollName, setPollName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!teacherName.trim() || !pollName.trim()) {
      alert("Please enter your name and poll name");
      return;
    }

    try {
      setLoading(true);
      const res = await createPoll(pollName);
      const poll = res.data.data;

      if (!poll?._id) {
        alert("Poll creation failed ❌");
        return;
      }

      navigate(`/teacher-dashboard/${poll._id}`, {
        state: { teacherName, pollName },
      });
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Failed to create poll ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-white"
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
          color: "#5C5B5B",
        }}
      >
        If you’re a teacher, you’ll be able to <span className="font-bold">create polls</span> and <span className="font-bold">view live results</span> for your students.
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
        {/* Teacher Name Input */}
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
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="Rahul Bajaj"
            className="w-full h-14 bg-[#F2F2F2] rounded px-4 text-black placeholder-gray-500"
          />
        </div>

        {/* Poll Name Input */}
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
            Enter Poll Name
          </label>
          <input
            type="text"
            value={pollName}
            onChange={(e) => setPollName(e.target.value)}
            placeholder="Enter Poll Name"
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
          {loading ? "Creating..." : "Continue"}
        </button>
      </div>
    </div>
  );
}

export default TeacherHome;
