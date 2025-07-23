import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import backgroundImage from './img.jpg';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      // Register user
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        firstName,
        lastName,
        email,
        password,
      });

      if (res.data.message === 'User registered') {
        // Auto-login after registration
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password,
        });

        // Save token and redirect
        localStorage.setItem('token', loginRes.data.token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed.';
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
        <h2>🎬 Join MovieBase</h2>
        <p>Create an account to explore trending movies and your personal watchlist.</p>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
