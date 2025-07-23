import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import backgroundImage from './img.jpg';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      console.log('Response from server:', res.data);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        alert('Login successful!');
        navigate('/dashboard');
      } else {
        alert('Login failed. No token received.');
      }
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      const message = err.response?.data?.message || 'Login failed.';
      alert(message);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="auth-container">
        <h2>🎥 Welcome Back</h2>
        <p>Login to access your movie dashboard</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
