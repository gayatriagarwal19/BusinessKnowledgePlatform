
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getDocuments = createAsyncThunk('documents/getDocuments', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/documents');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const documentSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDocuments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
      })
      .addCase(getDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default documentSlice.reducer;
