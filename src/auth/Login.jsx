import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, selectWorkspace } from "../api/auth.api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast"; // NEW: Import toast
import "../styles/auth.css"; 

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
        await selectWorkspace(workspaces[0].workspace_id);
        await checkAuth();
        navigate("/dashboard");
      } else {
        navigate("/select-workspace", { state: { workspaces } });
      }
    } catch (err) {
      const errorMsg = err.message || "Invalid credentials.";
      
      // --- NEW: Catch unverified users and redirect them to the OTP screen ---
      if (errorMsg.toLowerCase().includes("verify email")) {
        toast.error("Please verify your email to continue.");
        navigate("/verify-otp", { state: { email: form.email } });
        return; // Stop execution here so we don't set the local error state
      }
      
      // If it's a standard error (like wrong password), display it normally
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Lattrix // ID</h1>
          <p>Please identify yourself to continue</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Identity (Email)</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="user@domain.com"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Passkey</label>
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
            {isLoading ? "Authenticating..." : "Access System"}
          </button>
        </form>

        {error && <div className="auth-error">{error}</div>}

        <footer className="auth-footer">
          <span>New personnel? </span>
          <Link to="/signup">Initialize account</Link>
        </footer>
      </div>
    </div>
  );
}

export default Login;