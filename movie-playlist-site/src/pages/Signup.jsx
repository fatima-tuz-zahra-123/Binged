import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpWithEmail } from '../services/signUp.js'; // Adjust the path accordingly
import './Auth.css';



const Signup = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const isNavigating = useRef(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (isNavigating.current) return;

    // Basic validation
    if (!username || !fullName || !email || !password || !confirmPassword || !birthDate ) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await signUpWithEmail({
        email,
        password,
        fullName,
        username,
        birthDate,
      });

      if (result.success) {
        isNavigating.current = true;
        navigate('/confirmation', { replace: true });
      } else {
        setError(result.error || 'Signup failed');
      }
      
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join Binged to track, share, and discover movies</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="form-control">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>

          <div className="form-control">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={isLoading}
            />
          </div>

          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-control">
            <label htmlFor="birthDate">Birth Date</label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={isLoading}
            />
          </div>


          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="toggle-password"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
            <small>
              Strength: {password.length >= 10 ? 'Strong' : password.length >= 6 ? 'Moderate' : 'Weak'}
            </small>
          </div>

          <div className="form-control">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="toggle-password"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button 
            className="auth-button" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;