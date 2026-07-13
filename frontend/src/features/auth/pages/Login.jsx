import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import '../auth.form.scss'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Loading from '../../../components/Loading/Loading'

const Login = () => {

  const navigate = useNavigate();

  const { handleLogin, loading, user } = useAuth()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleLogin({email,password})
    navigate("/")
  }

  // While auth state is being determined (e.g. on page refresh), show loading
  if (loading) {
    return <Loading />
  }

  // If user is already logged in, redirect away from login page
  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="auth-page">
      <div className="form-container">

        <h1 className="form-title">Welcome back</h1>
        <p className="form-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              onChange={(e)=>{setEmail(e.target.value)}}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              onChange={(e)=>{setPassword(e.target.value)}}
              required
            />
          </div>

          <button className="button primary-button" type="submit">
            Login
          </button>

        </form>

        <p className="form-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </main>
  )
}

export default Login