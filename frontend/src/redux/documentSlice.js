
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getDocuments = createAsyncThunk('documents/getDocuments', async (searchTerm = '', { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`/documents?search=${searchTerm}`, config);
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
        state.documents = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default documentSlice.reducer;
