import { Poll } from "./models/poll.model.js";
import { v4 as uuidv4 } from "uuid";

const questionTimers = {};

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", async ({ pollId, studentId, name }) => {
      socket.join(pollId);
      const poll = await Poll.findById(pollId);
      if (!poll) return;

      // Generate studentId if not provided
      if (!studentId) studentId = uuidv4();

      const exists = poll.participants.some((p) => p.studentId === studentId);
      if (!exists) {
        poll.participants.push({ studentId, name });
        await poll.save();
      }

      // Emit current active question if exists
      if (poll.activeQuestion && !poll.activeQuestion.ended) {
        socket.emit("question:asked", poll.activeQuestion);
        startQuestionTimer(pollId, io, poll.activeQuestion.timeLimitSec);
      }

      io.to(pollId).emit("participants:updated", poll.participants);
    });

    socket.on("submit:answer", async ({ pollId, studentName, answerIndex }) => {
      const poll = await Poll.findById(pollId);
      if (!poll || !poll.activeQuestion || poll.activeQuestion.ended) return;

      const already = poll.activeQuestion.answers.some(
        (a) => a.studentName === studentName
      );
      if (already) return;

      poll.activeQuestion.answers.push({ studentName, answerIndex });
      await poll.save();

      io.to(pollId).emit("question:progress", poll.activeQuestion.answers);

      if (poll.activeQuestion.answers.length >= poll.participants.length) {
        endQuestion(pollId, io);
      }
    });

    socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
  });
};

export const startQuestionTimer = (pollId, io, timeLimitSec = 60) => {
  if (questionTimers[pollId]) clearTimeout(questionTimers[pollId]);
  questionTimers[pollId] = setTimeout(() => endQuestion(pollId, io), timeLimitSec * 1000);
};

export const endQuestion = async (pollId, io) => {
  if (questionTimers[pollId]) clearTimeout(questionTimers[pollId]);

  const poll = await Poll.findById(pollId);
  if (!poll || !poll.activeQuestion || poll.activeQuestion.ended) return;

  poll.activeQuestion.ended = true;
  poll.activeQuestion.endedAt = new Date();
  await poll.save();

  io.to(pollId).emit("question:ended", poll.activeQuestion);
};
