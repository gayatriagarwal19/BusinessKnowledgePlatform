import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

axios.defaults.baseURL = 'http://localhost:8000'; // Assuming backend runs on port 81000

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isAppLoaded: false,
  error: null,
  loginMessage: null, // New state for login success message
};

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    if (!localStorage.token) {
      // If no token, immediately return a payload indicating unauthenticated state
      return { status: 401, msg: 'No token found' };
    }

    setAuthToken(localStorage.token);

    try {
      const response = await axios.get('/api/auth/profile', {
        validateStatus: (status) => {
          return (status >= 200 && status < 300) || status === 401; // Treat 401 as success to prevent console error
        },
      });
      // If status is 401, it means no valid token, so we return a specific payload
      if (response.status === 401) {
        return { status: 401, msg: 'No token, authorization denied' };
      }
      return response.data;
    } catch (error) {
      // If the request fails for reasons other than 401 (e.g., network error, server down)
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loginMessage = null;
      localStorage.removeItem('token');
      setAuthToken(null);
    },
    clearLoginMessage: (state) => {
      state.loginMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        setAuthToken(action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        setAuthToken(action.payload.token);
        state.loginMessage = 'Login successful!'; // Set message on successful login
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.user = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAppLoaded = true; // Set to true when loadUser completes
        // If the payload indicates a 401 (no token found), set unauthenticated state
        if (action.payload && action.payload.status === 401) {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          localStorage.removeItem('token'); // Ensure token is removed if it was invalid
          setAuthToken(null);
        } else {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.loginMessage = null; // Clear message on successful loadUser
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAppLoaded = true; // Set to true even if loadUser fails
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload; // Keep error for other rejection reasons
      });
  },
});

export const { logout, clearLoginMessage } = authSlice.actions;
export default authSlice.reducer;
