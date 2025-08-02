
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const sendMessage = createAsyncThunk('chat/sendMessage', async (message, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/chat/send', { message });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ sender: 'user', text: action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push({ sender: 'bot', text: action.payload.reply });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.messages.push({ sender: 'bot', text: action.payload.msg || 'Sorry, something went wrong.' });
      });
  },
});

export const { addUserMessage } = chatSlice.actions;
export default chatSlice.reducer;
