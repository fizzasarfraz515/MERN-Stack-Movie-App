import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <nav
        style={{
          padding: '1rem',
          background: '#070707ff',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Link to="/register" style={{ marginRight: '10px', color: '#cecbc3ff' }}>Register</Link>
        <Link to="/login" style={{ marginRight: '10px', color: '#cecbc3ff' }}>Login</Link>
        <Link to="/dashboard" style={{ marginRight: '10px', color: '#cecbc3ff' }}>Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
