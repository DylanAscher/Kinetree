import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './components/AuthContext.jsx' // IMPORT THIS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>  {/* WRAP YOUR APP */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)