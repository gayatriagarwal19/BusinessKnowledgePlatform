
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getAnalyticsSummary = createAsyncThunk(
  'analytics/getSummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/analytics/summary');
      return res.data;
    } catch (err) {
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
        state.error = action.payload;
      });
  },
});

export default analyticsSlice.reducer;
