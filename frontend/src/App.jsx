import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import History from './pages/History'; // Make sure this import is here!

function App() {
  return (
    <Routes>
      {/* 1. The Landing Page (Login) */}
      <Route path="/" element={<Login />} />
      
      {/* 2. The Signup Page */}
      <Route path="/signup" element={<Signup />} />
      
      {/* 3. The Main Scanner Page (This was missing!) */}
      <Route path="/home" element={<Home />} />
      
      {/* 4. The History Page (This was missing!) */}
      <Route path="/history" element={<History />} />
    </Routes>
  );
}

export default App;