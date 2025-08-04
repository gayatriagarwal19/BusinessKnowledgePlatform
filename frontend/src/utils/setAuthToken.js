
import axios from 'axios';

// Set the base URL for Axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'; // Default to localhost for development

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default setAuthToken;
