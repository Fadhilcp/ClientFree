import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    updatedAt: 0
  },
  reducers: {
    refreshJobs(state) {
      state.updatedAt = Date.now();
    }
  }
});

export const { refreshJobs } = jobSlice.actions;
export default jobSlice.reducer;