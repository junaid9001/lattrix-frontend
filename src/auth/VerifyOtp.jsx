import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyOtp, resendOtp } from "../api/auth.api"; // Added resendOtp import
import toast from "react-hot-toast";
import "../styles/auth.css";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please sign up first.");
      navigate("/signup");
    }
  }, [email, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({ email, otp });
      toast.success("Email verified successfully!");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  // NEW: Handle resending the OTP
  async function handleResend() {
    setIsLoading(true);
    try {
      await resendOtp({ email });
      toast.success("A new verification code has been sent!");
      setOtp(""); // Clear the old input
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Verify Email</h1>
          <p>
            Enter the 6-digit code sent to <br />
            <strong style={{ color: "var(--accent-primary)" }}>{email}</strong>
          </p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="otp">OTP Code</label>
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength="6"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center tracking-widest text-lg"
              required
              autoFocus
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* UPDATED: Footer now has a column layout for the resend button */}
        <footer className="auth-footer" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "12px",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--accent-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
            >
              Code expired? Resend OTP
            </button>
          </div>
          <div>
            <span>Wrong email? </span>
            <Link to="/signup">Register again</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default VerifyOtp;