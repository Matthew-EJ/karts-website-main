// Import the main React library and the useState hook for managing component state
import React, { useState } from 'react';
// Import the mapping of backend API endpoints
import { API_URLS } from './api.js';

// Define the LoginPage functional component. 
// It accepts 'onLoginSuccess' and 'onCancel' functions as props to handle user navigation.
const LoginPage = ({ onLoginSuccess, onCancel }) => {
  // State variables for storing the form input values
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // State variable to store and display error messages related to login failure
  const [error, setError] = useState('');

  // Asynchronous function triggered when the user submits the login form
  const handleSignIn = async (e) => {
    // Prevent the default browser behavior of refreshing the page on form submission
    e.preventDefault();
    // Clear any previous error messages before attempting a new login
    setError('');

    try {
      // Send a POST request to the API's login endpoint
      const response = await fetch(API_URLS.login, {
        method: 'POST',
        // Define the HTTP headers to indicate we are sending JSON data
        headers: { 'Content-Type': 'application/json' },
        // Construct the request body as a JSON string containing the entered credentials
        body: JSON.stringify({ username, password }),
      });

      // Parse the JSON response returned by the server
      const result = await response.json();

      // Check if the server's authentication logic returned a 'success' status
      if (result.status === 'success') {
        // Save placeholder authentication tokens/roles inside the browser's localStorage
        // This simulates persistent sessions across page reloads
        localStorage.setItem('adminToken', 'active_session');
        localStorage.setItem('adminRole', 'admin');

        // Trigger the callback function provided by the parent component 
        // to switch the UI view to the authenticated admin dashboard
        onLoginSuccess();
      } else {
        // If login failed, update the error state with the server's error message, or a default message
        setError(result.message || "Invalid credentials");
      }
    } catch (err) {
      // Catch network errors (like the server being offline) and update the error state
      setError("Connection failed. Check your network status.");
    }
  };

  return (
    // Main full-screen wrapper container centering its content both vertically and horizontally
    <div className="flex items-center justify-center min-h-screen bg-[#fafafa] px-6 selection:bg-black selection:text-white">
      {/* Login Card Container: Sets width limits, padding, rounded corners, and shadow styling */}
      <div className="w-full max-w-[450px] space-y-12 bg-white p-12 sm:p-16 rounded-[48px] border border-gray-100 shadow-2xl shadow-black/5">

        {/* Header section containing logo and titles */}
        <div className="text-center space-y-4">
          {/* Main logo image. Features an error fallback configuration that attempts to display a stylized 'K' box if the image unloads */}
          <img src="/logo.png" alt="KARTS" className="w-14 h-14 object-contain mx-auto mb-8" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          {/* Logo Error Fallback Element. Hidden by default. Shown if the image above fails to load. */}
          <div className="hidden w-14 h-14 bg-black rounded-2xl items-center justify-center mx-auto mb-8 transform rotate-6 shadow-xl shadow-black/20">
            <span className="text-white text-xl font-black italic">K</span>
          </div>
          {/* Main Title heading element */}
          <h2 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">Admin Login</h2>
          {/* Subtitle helping user action directive */}
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Please Enter Credentials</p>
        </div>

        {/* Authentication Form Section */}
        <form className="space-y-8" onSubmit={handleSignIn}>

          {/* Conditional rendering for error messages. Shown only if 'error' state has a string value */}
          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-center py-4 rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Username Input Field Block */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Username</label>
              <input
                type="text" required
                className="block w-full rounded-[24px] border border-gray-100 bg-gray-50/50 px-6 py-5 text-sm font-black transition-all focus:bg-white focus:ring-[6px] focus:ring-black/5 outline-none placeholder:text-gray-200"
                placeholder="Enter username"
                value={username} // Controlled input binding to 'username' state
                onChange={(e) => setUsername(e.target.value)} // Update state on user input change
              />
            </div>

            {/* Password Input Field Block */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Password</label>
              <input
                type="password" required
                className="block w-full rounded-[24px] border border-gray-100 bg-gray-50/50 px-6 py-5 text-sm font-black transition-all focus:bg-white focus:ring-[6px] focus:ring-black/5 outline-none placeholder:text-gray-200"
                placeholder="••••••••"
                value={password} // Controlled input binding to 'password' state
                onChange={(e) => setPassword(e.target.value)} // Update state on user input change
              />
            </div>
          </div>

          {/* Form Action Buttons Container */}
          <div className="space-y-4 pt-4">
            {/* Primary Submission Button to trigger authentication */}
            <button type="submit" className="w-full bg-black text-white rounded-3xl py-6 text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/20">
              Login
            </button>
            {/* Secondary Cancel Button invoking the 'onCancel' prop */}
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-gray-400 text-[10px] font-black uppercase tracking-widest py-2 hover:text-black transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Expose the complete component logic to the outside modules
export default LoginPage;