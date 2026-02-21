import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCheckoutSession } from "../api/subscription.api";
import { useAuth } from "../context/AuthContext";
import "../styles/main.css"; 
import toast from "react-hot-toast";

const PLANS = [
  {
    id: "FREE",
    name: "Developer",
    price: "$0",
    features: ["5 APIs", "5 Minute Checks", "Community Support"],
    color: "var(--text-secondary)",
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$15",
    features: ["50 APIs", "1 Minute Checks", "Priority Support"],
    color: "#a855f7",
    recommended: true,
  },
  {
    id: "AGENCY",
    name: "Agency",
    price: "$45",
    features: ["Unlimited APIs", "30 Second Checks", "Dedicated Agent"],
    color: "#ec4899",
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (planId) => {
    // 3. Prevent action if it's the current plan or Free
    if (planId === "FREE" || planId === user?.plan) return; 
    
    setLoading(planId);
    try {
      const data = await createCheckoutSession(planId);
      window.location.href = data.url; 
    } catch (err) {
      toast.error("Failed to start checkout: " + JSON.stringify(err));
      setLoading(null);
    }
  };

  return (
    <div className="dashboard-container" style={{ textAlign: "center", padding: "40px" }}>
      
      <div style={{ maxWidth: "1200px", margin: "0 auto 20px auto", textAlign: "left" }}>
        <button 
            onClick={() => navigate("/dashboard")} 
            className="back-btn"
            style={{ 
                background: 'transparent', 
                border: '1px solid var(--border-glass)', 
                color: 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer', 
                width:'180px'
            }}
        >
            ← Back to Dashboard
        </button>
      </div>

      <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>Upgrade your Plan</h1>
      
      <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>
        Current Plan: <strong style={{ color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{user?.plan || "FREE"}</strong>
      </p>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "20px", 
        maxWidth: "1200px", 
        margin: "0 auto" 
      }}>
        {PLANS.map((plan) => {
            const isCurrent = user?.plan === plan.id;
            
            return (
              <div 
                key={plan.id} 
                className="card" 
                style={{ 
                  border: isCurrent 
                    ? "2px solid var(--accent-primary)" 
                    : plan.recommended 
                        ? `1px solid ${plan.color}` 
                        : "1px solid var(--border-glass)",
                  position: "relative",
                  padding: "30px",
                  background: 'var(--bg-subtle)'
                }}
              >
                {plan.recommended && !isCurrent && (
                  <span style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: plan.color,
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}>
                    RECOMMENDED
                  </span>
                )}
                
                {isCurrent && (
                   <span style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--accent-primary)",
                    color: "black",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}>
                    CURRENT PLAN
                  </span>
                )}

                <h3 style={{ color: plan.color, marginBottom: "10px" }}>{plan.name}</h3>
                <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "20px" }}>
                  {plan.price}<span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>/mo</span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, textAlign: "left", marginBottom: "30px" }}>
                  {plan.features.map((feat, i) => (
                    <li key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--border-glass)", color: "var(--text-secondary)" }}>
                       {feat}
                    </li>
                  ))}
                </ul>

                <button
                  className="btn-primary"
                  disabled={loading || isCurrent}
                  onClick={() => handleSubscribe(plan.id)}
                  style={{ 
                    width: "100%", 
                    background: isCurrent ? "var(--bg-deep)" : (plan.color || "var(--text-primary)"),
                    color: isCurrent ? "var(--text-muted)" : "black",
                    border: isCurrent ? "1px solid var(--border-glass)" : "none",
                    cursor: isCurrent ? "default" : "pointer",
                    opacity: (loading && loading !== plan.id) ? 0.5 : 1
                  }}
                >
                  {loading === plan.id ? "Redirecting..." : isCurrent ? "Active" : "Subscribe"}
                </button>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default Pricing;