import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Board from "./components/Board/Board";
import UserTaskGrid from "./components/Dashboard/UserTaskGrid/UserTaskGrid";  // ✅ Import UserTaskGrid component
import UserCalendar from "./components/Dashboard/UserCalendar/UserCalendar";  // ✅ Import UserCalendar component

function App() {
    const [boards, setBoards] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const storedAuth = localStorage.getItem("isAuthenticated");
        console.log("🚀 Checking LocalStorage on load:", storedAuth); // Debugging
        return storedAuth === "true";
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
    
        if (token) {
            console.log("🔄 Token found in storage, verifying...");
            
            fetch("http://localhost:8000/api/users/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) throw new Error("Token invalid or expired");
                return response.json();
            })
            .then(data => {
                console.log("✅ Token valid, user authenticated:", data);
                setIsAuthenticated(true);
            })
            .catch(error => {
                console.error("❌ Invalid token:", error);
                localStorage.removeItem("token");  // Clear expired token
                setIsAuthenticated(false);
            })
            .finally(() => {
                setLoading(false);
            });
        } else {
            console.log("❌ No token found, redirecting to login");
            setIsAuthenticated(false);
            setLoading(false);
        }
    }, []);
    
    // ✅ Handle Login & Persist in LocalStorage
    const handleLogin = (isAuth, token) => {
        console.log("🔑 Logging in, setting isAuthenticated:", isAuth);
        localStorage.setItem("isAuthenticated", isAuth);
        localStorage.setItem("token", token); // ✅ Store JWT token
        setIsAuthenticated(isAuth);
    };
    
    // ✅ Handle Logout
    const handleLogout = () => {
        console.log("🚪 Logging out...");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("token"); // ✅ Remove JWT token
        setIsAuthenticated(false);
    };
    

    console.log("🔥 Current state:", { isAuthenticated, loading, boards });

    return (
        <Router>
            <AppContent 
                isAuthenticated={isAuthenticated} 
                loading={loading} 
                boards={boards} 
                onLogin={handleLogin} 
                onLogout={handleLogout} 
            />
        </Router>
    );
}

// ✅ Component to fix Sidebar visibility
const AppContent = ({ isAuthenticated, loading, boards, onLogin, onLogout }) => {
    const location = useLocation();
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

    return (
        <div className="app">
            {/* ✅ Sidebar is hidden on login & register pages */}
            {!loading && isAuthenticated && !isAuthPage && (
                <Sidebar boards={boards} onCreateBoard={() => {}} onLogout={onLogout} />
            )}

            {/* ✅ Ensuring <Routes> only contains <Route> components */}
            <Routes>
                <Route path="/login" element={<Login onLogin={onLogin} />} />
                <Route path="/register" element={<Register />} />

                {!loading ? (
                    isAuthenticated ? (
                        <>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/tasks" element={<UserTaskGrid />} />  {/* ✅ Add this route */}
                            <Route path="/schedule" element={<UserCalendar/>} />
                            <Route path="/board/:boardId/*" element={<Board boards={boards} />} />
                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </>
                    ) : (
                        <Route path="*" element={<Navigate to="/login" />} />
                    )
                ) : null}
            </Routes>
        </div>
    );
};


export default App;
