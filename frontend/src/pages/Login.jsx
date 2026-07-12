import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authApi";
import { AuthContext } from "../context/authContextValue";
import { useToast } from "../context/ToastContext";
import "../styles/Login.css";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }               = useContext(AuthContext);
  const toast                   = useToast();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      localStorage.setItem("token", response.data.token);
      login(response.data.user);
      toast.success("Welcome back! Logged in successfully.");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page fade-up">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">S</span>
        </div>
        <span className="eyebrow">Welcome back</span>
        <h1>Login</h1>
        <p>Access your SwiftMart account to manage your cart and orders.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Create one →</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
