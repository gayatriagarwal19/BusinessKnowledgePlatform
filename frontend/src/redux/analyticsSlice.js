
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getAnalyticsSummary = createAsyncThunk(
  'analytics/getSummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/analytics/summary');
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 429) {
        // Treat this as a partial success and pass the data through
        return err.response.data;
      }
      return rejectWithValue(err.response.data);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    summary: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAnalyticsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnalyticsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(getAnalyticsSummary.rejected, (state, action) => {
        state.loading = false;
        console.log('Analytics Slice - Rejected Payload:', action.payload);
        // If the payload contains a specific error message for daily limit, treat it as a partial success
        if (action.payload && action.payload.error && action.payload.error.includes('daily limit')) {
          state.summary = action.payload; // We still get some data
          state.error = action.payload.error; // But we also have an error message
        } else {
          state.error = action.payload;
          state.summary = null;
        }
      });
  },
});

export default analyticsSlice.reducer;
