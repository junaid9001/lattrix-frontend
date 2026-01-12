import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/auth.api";
import "./auth.css";

function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signup(form);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Latrixx</h1>
          <p>Start monitoring your APIs for free</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="username">Full Name</label>
            <input
              id="username"
              name="username"
              placeholder="John Doe"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Work Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {error && <div className="auth-error">{error}</div>}

        <footer className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </footer>
      </div>
    </div>
  );
}

export default Signup;