import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

axios.defaults.baseURL = 'http://localhost:8000'; // Assuming backend runs on port 81000

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
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
      const response = await axios.get('/api/auth/profile');
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
      localStorage.removeItem('token');
      setAuthToken(null);
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
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload; // Keep error for other rejection reasons
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
