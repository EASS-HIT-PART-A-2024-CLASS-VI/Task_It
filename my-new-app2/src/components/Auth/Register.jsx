import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [photo, setPhoto] = useState(null);
    const navigate = useNavigate();


    const handleRegister = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("username", username);
        formData.append("first_name", firstName);
        formData.append("last_name", lastName);
        formData.append("email", email);
        formData.append("password", password);
        
        if (photo) {  // ✅ Only append if a photo is selected
            formData.append("photo", photo);
        }
    
        console.log("📌 Sending Register Data:", Object.fromEntries(formData.entries()));  // Debugging
    
        try {
            const response = await fetch("http://localhost:8000/api/users/signup", {
                method: "POST",
                body: formData  // ✅ Send as FormData, NOT JSON
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log("✅ Registration Successful:", data);
                localStorage.setItem("token", data.access_token);
                alert("Registration successful! Please log in.");
                navigate("/login");
            } else {
                console.error("❌ Registration Failed:", data);
                alert(data.detail || "Registration failed");
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
                        <label>First Name:</label>
                        <input
                            type="text"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Last Name:</label>
                        <input
                            type="text"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
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
                    <div className="input-group">
                        <label>Profile Photo:</label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={(e) => setPhoto(e.target.files[0])}  // ✅ Handle file upload
                        />
                    </div>
                    <button type="submit" className="register-button">Sign Up</button>
                </form>
            </div>
        </div>
    );
}

export default Register;
