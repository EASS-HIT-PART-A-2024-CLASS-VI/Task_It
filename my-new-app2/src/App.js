import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Board from "./components/Board/Board";

function App() {
    const [boards, setBoards] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const storedAuth = localStorage.getItem("isAuthenticated");
        console.log("🚀 Checking LocalStorage on load:", storedAuth); // Debugging
        return storedAuth === "true";
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            console.log("❌ Not authenticated, skipping fetch.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            console.log("📡 Fetching boards from backend...");
            try {
                const response = await fetch("http://localhost:8000/api/groups", {
                    credentials: "include",
                });
                if (!response.ok) throw new Error("Failed to fetch groups");
                const data = await response.json();
                console.log("✅ Fetched boards:", data);
                setBoards(data);
            } catch (error) {
                console.error("❌ Error fetching groups:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated]);

    // ✅ Handle Login & Persist in LocalStorage
    const handleLogin = (isAuth) => {
        console.log("🔑 Logging in, setting isAuthenticated:", isAuth);
        localStorage.setItem("isAuthenticated", isAuth);
        setIsAuthenticated(isAuth);
    };

    // ✅ Handle Logout
    const handleLogout = () => {
        console.log("🚪 Logging out...");
        localStorage.removeItem("isAuthenticated");
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
            {/* ✅ Sidebar is hidden on login & register */}
            {!loading && isAuthenticated && !isAuthPage && (
                <Sidebar boards={boards} onCreateBoard={() => {}} onLogout={onLogout} />
            )}

            <Routes>
                <Route path="/login" element={<Login onLogin={onLogin} />} />
                <Route path="/register" element={<Register />} />

                {!loading && isAuthenticated ? (
                    <>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/board/:boardId/*" element={<Board boards={boards} />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
            </Routes>
        </div>
    );
};

export default App;
