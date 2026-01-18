import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth.api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { selectWorkspace } from "../api/auth.api";
import "./auth.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const res = await login(form);
    const workspaces = res.data.workspaces || [];

    if (workspaces.length === 0) {
      setError("No workspaces found. Please contact support.");
    } else if (workspaces.length === 1) {
      // Auto-select if only one
      await selectWorkspace(workspaces[0].workspace_id);
      await checkAuth();
      navigate("/dashboard");
    } else {
      // Navigate to selection screen
      navigate("/select-workspace", { state: { workspaces } });
    }
  } catch (err) {
    setError(err.message || "Invalid credentials.");
  } finally {
    setIsLoading(false);
  }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Latrixx</h1>
          <p>Sign in to your monitor dashboard</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
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
            <div className="label-row">
              <label htmlFor="password">Password</label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {error && <div className="auth-error">{error}</div>}

        <footer className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </footer>
      </div>
    </div>
  );
}

export default Login;
