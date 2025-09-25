import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (!selectedRole) return alert("Please select a role to continue");
    navigate(selectedRole === "student" ? "/student" : "/teacher");
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Top-left Intervue Poll button */}
      <div className="absolute flex flex-row items-center gap-2 w-[134px] h-[31px] left-8 ml-165 mt-25 top-8 bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] rounded-[24px] px-2 py-0">
        <div className="w-[14.66px] h-[14.65px] bg-white rounded-full"></div>
        <span className="text-white font-sora font-semibold text-[14px] leading-[18px]">
          Intervue Poll
        </span>
      </div>

      {/* Heading */}
      <div className="absolute flex flex-col items-center gap-2 w-[737px] left-1/2 top-[25%] -translate-x-1/2">
        <h1 className="w-full font-sora font-normal text-[40px] leading-[50px] text-center text-black">
          Welcome to the <span className="font-bold">Live Polling System</span>
        </h1>
        <p className="w-full font-sora font-normal text-[19px] leading-[24px] text-center text-black/50">
          Please select the role that best describes you to begin using the live polling <br/>system
        </p>
      </div>

      {/* Student Card */}
      <div
        onClick={() => setSelectedRole("student")}
        className={`absolute flex flex-col justify-center items-start gap-4 w-[387px] h-[143px] mt-10 left-[25%] top-[50%] -translate-y-1/2 rounded-[10px] p-6 cursor-pointer transition-shadow 
          ${selectedRole === "student" ? "bg-[#E6E0FA] shadow-lg" : "bg-white shadow-md hover:shadow-lg"}`}
      >
        <span className="text-black font-sora font-semibold text-[23px] leading-[29px]">
          I’m a Student
        </span>
        <p className="text-[#454545] font-sora font-normal text-[16px] leading-[20px]">
           If you’re a student, you’ll be able to submit your answers, participate in live polls.
        </p>
      </div>

      {/* Teacher Card */}
      <div
        onClick={() => setSelectedRole("teacher")}
        className={`absolute flex flex-col justify-center mt-10 items-start gap-4 w-[387px] h-[143px] left-[55%] top-[50%] -translate-y-1/2 rounded-[10px] p-6 cursor-pointer transition-shadow border
          ${selectedRole === "teacher" ? "bg-[#E6E0FA] shadow-lg border-[#8F64E1]" : "border-[#D9D9D9] hover:shadow-md"}`}
      >
        <span className="text-black font-sora font-semibold text-[23px] leading-[29px]">
          I’m a Teacher
        </span>
        <p className="text-[#454545] font-sora font-normal text-[16px] leading-[20px]">
          Submit answers and view live poll results in real-time.
        </p>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        className={`absolute left-1/2 top-[70%] -translate-x-1/2 w-[234px] h-[58px] rounded-[34px] text-white font-sora font-semibold text-[18px] leading-[23px] transition-colors
          ${selectedRole ? "bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] hover:opacity-90 cursor-pointer" : "bg-gray-300 cursor-not-allowed"}`}
        disabled={!selectedRole}
      >
        Continue
      </button>
    </div>
  );
}

export default Home;
