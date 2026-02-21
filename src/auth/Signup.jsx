import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/auth.api";
import toast from "react-hot-toast"; // Import toast
import "../styles/auth.css";

function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
     
      await signup(form);
      
      toast.success("Account created! Please verify your email.");
      
      
      navigate("/verify-otp", { state: { email: form.email } });
      
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed. Try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Create Account</h1>
          <p>Start monitoring your APIs with Lattrix</p>
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
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <footer className="auth-footer">
          <span>Already have an account? </span>
          <Link to="/login">Sign in</Link>
        </footer>
      </div>
    </div>
  );
}

export default Signup;