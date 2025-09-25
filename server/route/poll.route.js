import { Router } from "express";
import {
  createPoll,
  askQuestion,
  joinPoll,
  submitAnswer,
  getLiveResult,
  getPollHistory,
  getQuestionResults,
  removeStudent,
} from "../controllers/poll.controller.js";

import { getPollById } from "../controllers/poll.controller.js"; // make sure getPollById exists

const router = Router();

// Create a new poll
router.post("/", createPoll);

// Get poll by ID
router.get("/:id", getPollById);

// Ask a new question
router.post("/:id/questions", askQuestion);

// Remove a student
router.post("/remove-student", removeStudent);

// Poll history
router.get("/:id/history", getPollHistory);

// Student joins poll
router.post("/join", joinPoll);

// Student submits answer
router.post("/submit-answer", submitAnswer);

// Get live results for active question
router.get("/:id/live-result", getLiveResult);

// Get results of a specific question
router.get("/:pollId/results/:questionId", getQuestionResults);

export default router;
