import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail } from '../services/signUp';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    birthDate: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Setting up your account...');

    const result = await signUpWithEmail(formData);
    
    if (result.error) {
      setMessage(`❌ ${result.error}`);
      setLoading(false);
    } else {
      setMessage('✅ Sign-up initiated! Please check your email and click the confirmation link to activate your account.');
      // Don't navigate away - let user see the instruction to check email
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input 
          name="fullName" 
          placeholder="Full Name" 
          onChange={handleChange} 
          required 
          style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input 
          name="username" 
          placeholder="Username" 
          onChange={handleChange} 
          required 
          style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input 
          name="email" 
          placeholder="Email" 
          type="email" 
          onChange={handleChange} 
          required 
          style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input 
          name="password" 
          placeholder="Password" 
          type="password" 
          onChange={handleChange} 
          required 
          style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input 
          name="birthDate" 
          type="date" 
          onChange={handleChange} 
          required 
          style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            display: 'block', 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      {message && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          borderRadius: '4px',
          backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e9',
          color: message.includes('❌') ? '#d32f2f' : '#388e3c'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}