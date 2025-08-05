
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// This thunk will not use axios directly for streaming
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message, { dispatch, rejectWithValue }) => {
    dispatch(addBotMessage({ text: '', streaming: true })); // Add a placeholder for the bot's response
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseUrl}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message }),
      });

      console.log('Chat Slice: Token being sent:', localStorage.getItem('token') ? localStorage.getItem('token').substring(0, 10) + '...' : 'No token');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        // SSE data format: data: { "reply": "chunk" }\n\n
        chunk.split('\n\n').forEach(event => {
          if (event.startsWith('data:')) {
            try {
              const data = JSON.parse(event.substring(5));
              if (data.reply) {
                dispatch(updateBotMessage(data.reply));
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          } else if (event.startsWith('event: error')) {
            try {
              const errorData = JSON.parse(event.substring('event: error\ndata:'.length));
              dispatch(setChatError(errorData.msg));
            } catch (e) {
              console.error("Error parsing SSE error event:", e);
            }
          }
        });
      }
      dispatch(stopBotStreaming());
      return { success: true };
    } catch (err) {
      dispatch(stopBotStreaming());
      return rejectWithValue(err.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    isLoading: false,
    error: null,
    isBotTyping: false,
    currentBotMessageIndex: -1, // Index of the message currently being streamed
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ sender: 'user', text: action.payload });
      state.error = null; // Clear previous errors on new message
    },
    addBotMessage: (state, action) => {
      state.messages.push({ sender: 'bot', text: action.payload.text, streaming: action.payload.streaming });
      state.isBotTyping = true;
      state.currentBotMessageIndex = state.messages.length - 1;
    },
    updateBotMessage: (state, action) => {
      if (state.currentBotMessageIndex !== -1) {
        state.messages[state.currentBotMessageIndex].text += action.payload;
      }
    },
    stopBotStreaming: (state) => {
      if (state.currentBotMessageIndex !== -1) {
        state.messages[state.currentBotMessageIndex].streaming = false;
      }
      state.isBotTyping = false;
      state.currentBotMessageIndex = -1;
    },
    setChatError: (state, action) => {
      state.error = action.payload;
      state.isBotTyping = false;
      if (state.currentBotMessageIndex !== -1) {
        state.messages[state.currentBotMessageIndex].streaming = false;
        state.messages[state.currentBotMessageIndex].text = state.messages[state.currentBotMessageIndex].text || 'Sorry, something went wrong.';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handled by streaming reducers
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isBotTyping = false;
        // If there was no partial message, add a generic error message
        if (state.currentBotMessageIndex === -1 || state.messages[state.currentBotMessageIndex].text === '') {
          state.messages.push({ sender: 'bot', text: action.payload || 'Sorry, something went wrong.' });
        }
        state.currentBotMessageIndex = -1;
      });
  },
});

export const { addUserMessage, addBotMessage, updateBotMessage, stopBotStreaming, setChatError } = chatSlice.actions;
export default chatSlice.reducer;
