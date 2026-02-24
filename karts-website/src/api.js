// Define the base URL for the backend API connection. 
// Uses the Render.com cloud deployment URL.
const API_BASE_URL = 'https://karts-badkend-sql.onrender.com';

// Map specific endpoint aliases for easier use across the frontend.
// This prevents hardcoding the URL into every component.
export const API_URLS = {
  login: `${API_BASE_URL}/api/login`,               // Endpoint for user authentication
  announcements: `${API_BASE_URL}/api/announcements`, // Endpoint for fetching/managing announcements
  events: `${API_BASE_URL}/api/events`,             // Endpoint for fetching/managing events
};

// Export the base URL natively just in case other modules need the raw link
export default API_BASE_URL;
