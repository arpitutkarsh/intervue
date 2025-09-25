import { Poll } from "../models/poll.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

let ioInstance;
const setIoInstance = (io) => { ioInstance = io; };

const questionTimers = {};

// Create a new poll
const createPoll = async (req, res) => {
  try {
    const { title } = req.body;
    const poll = new Poll({ title });
    await poll.save();
    res.status(201).json(new ApiResponse(201, poll, "Poll Created Successfully"));
  } catch (error) {
    throw new ApiError(500, "Error Creating Poll");
  }
};

// Get poll by ID
const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) throw new ApiError(404, "Poll not found");
    return res.status(200).json(new ApiResponse(200, poll, "Poll Fetched Successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching poll");
  }
};

// Get poll history
const getPollHistory = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) throw new ApiError(404, "Poll not found");

    const history = poll.questions.map(q => ({
      questionId: q._id,
      text: q.text,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      correctAnswer: q.options[q.correctAnswerIndex] || null,
      timeLimitSec: q.timeLimitSec,
      startedAt: q.startedAt,
      ended: q.ended,
      answers: q.answers.map(ans => ({
        studentName: ans.studentName,
        optionIndex: ans.answerIndex,
        optionText: q.options[ans.answerIndex],
        answeredAt: ans.answeredAt
      }))
    }));

    return res.status(200).json(new ApiResponse(200, history, "Poll history fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

// Remove a student from poll
const removeStudent = async (req, res) => {
  try {
    const { pollId, studentId } = req.body;
    const poll = await Poll.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    poll.participants = poll.participants.filter(p => p.studentId !== studentId);
    await poll.save();
    return res.status(200).json(new ApiResponse(200, poll.participants, "Student Removed Successfully"));
  } catch (error) {
    throw new ApiError(500, "Error removing student");
  }
};

// Ask a new question
const askQuestion = async (req, res) => {
  try {
    const { text, options, correctAnswerIndex, timeLimitSec } = req.body;
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (poll.activeQuestion && !poll.activeQuestion.ended) {
      const now = new Date();
      const questionEndTime = new Date(poll.activeQuestion.startedAt);
      questionEndTime.setSeconds(questionEndTime.getSeconds() + poll.activeQuestion.timeLimitSec);
      if (now < questionEndTime) {
        return res.status(400).json({ message: "Previous question is still live" });
      } else {
        poll.activeQuestion.ended = true;
        poll.activeQuestion.endedAt = questionEndTime;
        await poll.save();
      }
    }

    const validOptions = (options || []).filter(o => o && o.trim());
    if (validOptions.length < 2) return res.status(400).json({ message: "At least 2 options required" });
    if (correctAnswerIndex < 0 || correctAnswerIndex >= validOptions.length)
      return res.status(400).json({ message: "Correct answer index invalid" });

    const newQuestion = {
      text: text.trim(),
      options: validOptions,
      correctAnswerIndex,
      startedAt: new Date(),
      ended: false,
      answers: [],
      timeLimitSec: timeLimitSec || 60
    };

    poll.activeQuestion = newQuestion;
    poll.questions.push(newQuestion);
    await poll.save();

    if (ioInstance) {
      ioInstance.to(poll._id.toString()).emit("question:asked", newQuestion);
      startQuestionTimer(poll._id.toString(), ioInstance, newQuestion.timeLimitSec);
    }

    return res.status(201).json(new ApiResponse(201, newQuestion, "Question Live"));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error asking question", error: err.message });
  }
};

// Timer
const startQuestionTimer = (pollId, io, timeLimitSec = 60) => {
  if (questionTimers[pollId]) clearTimeout(questionTimers[pollId]);
  questionTimers[pollId] = setTimeout(() => endQuestion(pollId, io), timeLimitSec * 1000);
};

const endQuestion = async (pollId, io) => {
  if (questionTimers[pollId]) clearTimeout(questionTimers[pollId]);
  const poll = await Poll.findById(pollId);
  if (!poll || !poll.activeQuestion || poll.activeQuestion.ended) return;

  poll.activeQuestion.ended = true;
  poll.activeQuestion.endedAt = new Date();
  await poll.save();

  io.to(pollId).emit("question:ended", poll.activeQuestion);
};

// Student joins poll
const joinPoll = async (req, res) => {
  try {
    const { pollId, studentId, name } = req.body;
    if (!studentId || !name) throw new ApiError(400, "Student Id and Name required");

    const poll = await Poll.findById(pollId);
    if (!poll) throw new ApiError(404, "Poll not found");

    const exists = poll.participants.some(p => p.studentId === studentId);
    if (!exists) {
      poll.participants.push({ studentId, name });
      await poll.save();
    }

    return res.status(200).json(new ApiResponse(200, { poll, studentId, name }, "Joined Poll Successfully"));
  } catch (error) {
    throw new ApiError(500, "Error joining poll");
  }
};

// Submit answer
const submitAnswer = async (req, res) => {
  try {
    const { pollId, studentName, answerIndex } = req.body;
    if (answerIndex === undefined) throw new ApiError(400, "Answer required");

    const poll = await Poll.findById(pollId);
    if (!poll || !poll.activeQuestion) throw new ApiError(400, "Wait for Teacher to ask Question");

    const now = new Date();
    const questionEndTime = new Date(poll.activeQuestion.startedAt);
    questionEndTime.setSeconds(questionEndTime.getSeconds() + poll.activeQuestion.timeLimitSec);

    if (poll.activeQuestion.ended || now >= questionEndTime) {
      poll.activeQuestion.ended = true;
      poll.activeQuestion.endedAt = questionEndTime;
      await poll.save();
      throw new ApiError(400, "Poll Ended");
    }

    const alreadyAnswered = poll.activeQuestion.answers.some(
      a => a.studentName.toLowerCase() === studentName.toLowerCase()
    );
    if (alreadyAnswered) throw new ApiError(400, "Already Answered");

    poll.activeQuestion.answers.push({ studentName, answerIndex, answeredAt: new Date() });
    await poll.save();
    res.status(200).json(new ApiResponse(200, poll.activeQuestion.answers, "Answer Submitted Successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to Submit Answer");
  }
};

// Get live results
const getLiveResult = async (req, res) => {
  try {
    const { id: pollId } = req.params; // match :id in route
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    let question = poll.activeQuestion;
    if (!question) {
      question = poll.questions[poll.questions.length - 1];
      if (!question) return res.status(404).json({ message: "No question found" });
    }

    const studentMap = new Map();
    question.answers.forEach(ans => studentMap.set(ans.studentName.toLowerCase(), ans.answerIndex));

    const counts = question.options.map(() => 0);
    let correctCount = 0;
    studentMap.forEach(answerIndex => {
      counts[answerIndex] += 1;
      if (answerIndex === question.correctAnswerIndex) correctCount += 1;
    });

    const totalAnswers = studentMap.size;

    res.json({
      statusCode: 200,
      success: true,
      message: "Live results fetched successfully",
      data: {
        question: question.text,
        options: question.options,
        counts,
        totalAnswers,
        totalParticipants: poll.participants.length,
        correctCount,
        correctAnswerIndex: question.correctAnswerIndex
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ statusCode: 500, success: false, message: "Server error" });
  }
};


// Get results of a specific question
const getQuestionResults = async (req, res) => {
  try {
    const { pollId, questionId } = req.params;
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const question = poll.questions.id(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const counts = new Array(question.options.length).fill(0);
    question.answers.forEach(ans => {
      if (ans.answerIndex >= 0 && ans.answerIndex < counts.length) counts[ans.answerIndex]++;
    });

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Question results fetched successfully",
      data: {
        questionId: question._id,
        question: question.text,
        options: question.options,
        counts,
        totalAnswers: question.answers.length,
        totalParticipants: poll.participants.length,
        correctAnswerIndex: question.correctAnswerIndex
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  createPoll,
  getPollById,
  getPollHistory,
  askQuestion,
  removeStudent,
  joinPoll,
  submitAnswer,
  getLiveResult,
  getQuestionResults,
  endQuestion,
  setIoInstance
};
