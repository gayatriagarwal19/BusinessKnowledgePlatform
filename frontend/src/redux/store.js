
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import documentReducer from './documentSlice';
import chatReducer from './chatSlice';
import analyticsReducer from './analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentReducer,
    chat: chatReducer,
    analytics: analyticsReducer,
  },
});
