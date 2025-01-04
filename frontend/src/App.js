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
        console.log("Current boards state:", boards);
        const fetchData = async () => {
            // Simulating user authentication loading
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleLogin = (isAuth) => {
        setIsAuthenticated(isAuth);
    };

    const handleCreateBoard = (newBoardName) => {
        console.log("handleCreateBoard invoked with:", newBoardName);
        if (!newBoardName.trim()) {
            alert("Board name cannot be empty.");
            return;
        }
        const newBoard = {
            id: Date.now(),
            name: newBoardName,
        };
        setBoards((prevBoards) => [...prevBoards, newBoard]);
    };

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
                            <Route path="/board/:boardId" element={<Board boards={boards} />} />
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
