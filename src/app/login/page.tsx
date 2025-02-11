'use client';
import { useState, FormEvent } from 'react';
import { LoginCredentials, useAuth } from '../authcontext';


export default function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const { login, isLoading, auth, logout } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async (e: FormEvent) => {  
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  if (auth) {
    return <form onSubmit={handleLogout}><div>You are already logged in as {auth.username} <button type="submit">Logout</button> </div></form>; 
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="username"
        value={credentials.username}
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        placeholder="Username"
        required
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}