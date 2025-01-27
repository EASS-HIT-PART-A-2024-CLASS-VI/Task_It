import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Board from "./components/Board/Board";

function App() {
    const [boards, setBoards] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) return; // Only fetch if authenticated
            setLoading(true); // Ensure loading state is updated

            try {
                console.log("Fetching boards from backend...");
                const response = await fetch("http://localhost:8000/api/groups", {
                    credentials: 'include' // Add this to include auth cookies
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch groups");
                }
                const data = await response.json();
                console.log("Fetched boards:", data);
                setBoards(data); // Set boards after fetching
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setLoading(false); // Loading should stop after fetch attempt
            }
        };
        fetchData();
    }, [isAuthenticated]);

    const handleLogin = (isAuth) => {
        console.log("Setting auth state to:", isAuth);
        setIsAuthenticated(isAuth);
    };

    const handleCreateBoard = async (newBoard) => {
        setBoards(prevBoards => {
            console.log("Previous boards:", prevBoards);
            const updatedBoards = [...prevBoards, newBoard];
            console.log("Updated boards:", updatedBoards);
            return updatedBoards;
        });
    };

    console.log("Current state:", { isAuthenticated, loading, boards });


    return (
        <Router>
            <div className="app">
                {!loading && isAuthenticated && (
                    <Sidebar boards={boards} onCreateBoard={handleCreateBoard} />
                )}
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    {!loading && isAuthenticated ? (
                        <>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/board/:boardId/*" element={<Board boards={boards} />} />
                        </>
                    ) : (
                        <Route path="*" element={<Login onLogin={handleLogin} />} />
                    )}
                </Routes>
            </div>
        </Router>
    );
}

export default App;