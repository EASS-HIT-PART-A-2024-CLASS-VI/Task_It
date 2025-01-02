import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Login successful!");
                onLogin(true); // Notify App.js of successful login
                navigate("/dashboard"); // Redirect to dashboard
            } else {
                alert(data.detail || "Login failed.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("Something went wrong. Please try again.");
        }
    };



    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome to Your Planner</h2>
                <p>Please log in to access your account</p>
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password:</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="show-password"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? "🙈" : "👁"}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="login-button">
                        Log In
                    </button>
                </form>
                <div className="login-footer">
                    <a href="/forgot-password">Forgot your password?</a>
                    <span> | </span>
                    <a href="/register">Sign up for an account</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
