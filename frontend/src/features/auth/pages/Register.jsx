import React,{ useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../auth.form.scss'
import useAuth from '../hooks/useAuth'
import Loading from '../../../components/Loading/Loading'

const Register = () => {

  const navigate = useNavigate()

  const { handleRegister, loading } = useAuth()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleRegister({username,email,password})
    navigate("/")
  }

  if(loading) {
    return <Loading />
  }

  return (
    <main className="auth-page">
      <div className="form-container">

        <h1 className="form-title">Create account</h1>
        <p className="form-subtitle">Sign up to get started</p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="name">Username</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              onChange={(e)=>{setUsername(e.target.value)}}
              required
            />
          </div>

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
            Register
          </button>

        </form>

        <p className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </main>
  )
}

export default Register