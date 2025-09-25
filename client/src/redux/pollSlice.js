import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/pollApi";

export const fetchPoll = createAsyncThunk("poll/fetchPoll", async (id) => {
  const res = await api.getPollById(id);
  return res.data.data;
});

export const pollSlice = createSlice({
  name: "poll",
  initialState: {
    currentPoll: null,
    activeQuestion: null,
    participants: [],
    loading: false,
    error: null,
  },
  reducers: {
    setActiveQuestion: (state, action) => {
      state.activeQuestion = action.payload;
    },
    updateParticipants: (state, action) => {
      state.participants = action.payload;
    },
    addAnswer: (state, action) => {
      if (state.activeQuestion) state.activeQuestion.answers.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPoll.pending, (state) => { state.loading = true; })
      .addCase(fetchPoll.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPoll = action.payload;
        state.activeQuestion = action.payload.activeQuestion;
        state.participants = action.payload.participants;
      })
      .addCase(fetchPoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setActiveQuestion, updateParticipants, addAnswer } = pollSlice.actions;
export default pollSlice.reducer;
