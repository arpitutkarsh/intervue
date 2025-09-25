import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  answerIndex: {
    type: Number,
    required: true
  }, // index of chosen option
  answeredAt: {
    type: Date,
    default: Date.now
  },
});

const activeQuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  correctAnswerIndex: {
    type: Number
  },
  ended: {
    type: Boolean,
    default: false
  },
  endedAt: {
    type: Date
  },
  answers: [responseSchema],
  timeLimitSec: {
    type: Number,
    default: 60 // configurable per question, default 60 seconds
  }
});

const participantSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
});

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    }, // poll title
    questions: {
      type: [activeQuestionSchema],
      default: []
    }, // all questions
    activeQuestion: {
      type: activeQuestionSchema,
      default: null
    }, // current active
    participants: {
      type: [participantSchema],
      default: []
    }, // students joined
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active"
    },
  },
  { timestamps: true }
);

export const Poll = mongoose.model("Poll", pollSchema);
