import React, { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    console.log("Password reset email sent to:", email);
    setEmailSent(true);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "400px",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Forgot Password</h2>
        {emailSent ? (
          <p style={{ textAlign: "center", color: "green" }}>
            A password reset link has been sent to your email.
          </p>
        ) : (
          <form
            onSubmit={handleForgotPassword}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#0073e6",
                color: "#fff",
                fontSize: "16px",
              }}
            >
              Send Reset Link
            </button>
          </form>
        )}
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          <a
            href="/"
            style={{
              color: "#0073e6",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
