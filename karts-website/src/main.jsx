// Import StrictMode from React to highlight potential problems in the application during development
import { StrictMode } from 'react'
// Import createRoot from ReactDOM to initialize the React application mapping to the DOM
import { createRoot } from 'react-dom/client'
// Import the global CSS stylesheet (Tailwind directives are typically injected here)
import './index.css'
// Import the root App component that contains the main application layout and routing
import App from './App.jsx'

// Find the HTML element with id 'root' and render the React application inside it
createRoot(document.getElementById('root')).render(
  // Wrap the application in StrictMode to activate additional checks and warnings
  <StrictMode>
    {/* Render the core interface component */}
    <App />
  </StrictMode>,
)
