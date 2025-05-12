import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import CryptoJS from 'crypto-js';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('id, username, full_name, password_hash, email')
        .eq('email', formData.email)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          throw new Error('No account found with this email address');
        } else {
          throw new Error(`Database error: ${userError.message}`);
        }
      }

      if (!userData) {
        throw new Error('Account not found');
      }

      if (userData.password_hash && userData.password_hash !== "NEEDS_RESET") {
        const [salt, storedHash] = userData.password_hash.split(':');
        const calculatedHash = CryptoJS.SHA512(formData.password + salt).toString();

        if (calculatedHash !== storedHash) {
          throw new Error('Invalid password');
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (authError) throw new Error(authError.message);
      }

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        throw new Error("Error establishing session. Please try again.");
      }

      if (authData?.session) {
        localStorage.setItem('sessionExpiry', new Date(authData.session.expires_at).toISOString());
      }

      localStorage.setItem('userProfile', JSON.stringify({
        id: userData.id,
        username: userData.username,
        fullName: userData.full_name,
        email: userData.email
      }));

      setMessage('✅ Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
      return;
    } catch (error) {
      setMessage(`❌ ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome back!</h2>
          <p>Login to continue your movie journey</p>
        </div>

        {message && <div className={`auth-${message.startsWith('❌') ? 'error' : 'success'}`}>{message}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            className="auth-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          <p style={{ marginTop: '0.5rem' }}>
            <Link to="/forgot-password" className="auth-link-muted">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;