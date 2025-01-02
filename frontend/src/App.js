import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import Kanban from "./components/Kanban/Kanban";
import ListView from "./components/ListView/ListView";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [groups, setGroups] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true); // Step 4: Add loading state

    useEffect(() => {
        const fetchData = async () => {
            if (isAuthenticated) {
                await fetchGroups();
                await fetchTasks();
            }
            setLoading(false); // Set loading to false after data fetching
        };
        fetchData();
    }, [isAuthenticated]);

    const fetchGroups = async () => {
        try {
            const response = await fetch("/api/groups");
            const data = await response.json();
            setGroups(data || []); // Default to an empty array
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await fetch("/api/tasks");
            const data = await response.json();
            setTasks(data || []); // Default to an empty array
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const handleLogin = (isAuth) => {
        setIsAuthenticated(isAuth);
        setLoading(true); // Reset loading when logging in
    };

    return (
        <Router>
            <div className="app">
                {!loading && isAuthenticated && <Sidebar groups={groups} />}
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    {!loading && isAuthenticated ? (
                        <>
                            <Route path="/dashboard" element={<Dashboard groups={groups} />} />
                            <Route path="/kanban" element={<Kanban tasks={tasks} />} />
                            <Route path="/list" element={<ListView tasks={tasks} />} />
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
