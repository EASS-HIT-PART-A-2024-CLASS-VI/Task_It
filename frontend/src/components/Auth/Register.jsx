import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/users/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Registration successful! Please log in.");
                navigate("/");
            } else {
                alert(data.detail || "Registration failed.");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("Something went wrong. Please try again.");
        }
    };


    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
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
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="register-button">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
