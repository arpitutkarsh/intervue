import axios from "axios";

const API_URL = "https://intervue-backend-lltr.onrender.com/api/polls"; // Update if your backend URL is different

// Create a new poll
export const createPoll = (title) => axios.post(`${API_URL}`, { title });

// Get poll details by ID
export const getPollById = (id) => axios.get(`${API_URL}/${id}`);

// Ask a new question in a poll
// payload = { text: "Question text", options: ["Option1", "Option2", ...] }
export const askQuestion = (pollId, payload) => 
  axios.post(`${API_URL}/${pollId}/questions`, payload);

// Join a poll as a student
// payload = { pollId, studentName }
export const joinPoll = (payload) => axios.post(`${API_URL}/join`, payload);

// Submit answer as student
// payload = { pollId, studentId, questionId, answer }
export const submitAnswer = (payload) => 
  axios.post(`${API_URL}/submit-answer`, payload);

// Get live results for a poll
export const getLiveResult = (pollId) => axios.get(`${API_URL}/${pollId}/live-result`);

// Get poll history
export const getPollHistory = (pollId) => axios.get(`${API_URL}/${pollId}/history`);

// Remove a student from the poll
// payload = { pollId, studentId }
export const removeStudent = (payload) => 
  axios.post(`${API_URL}/remove-student`, payload);
