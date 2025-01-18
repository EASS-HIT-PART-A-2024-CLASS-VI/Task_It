import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ boards = [], onCreateBoard }) {
    const [newBoardName, setNewBoardName] = useState("");

    useEffect(() => {
        console.log("Sidebar re-rendered. Boards:", boards); // Debug log
    }, [boards]);

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!newBoardName.trim()) {
            alert("Board name cannot be empty.");
            return;
        }

        try {
            // Make sure this URL matches your FastAPI server address
            const response = await fetch("http://localhost:8000/api/groups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Add CORS headers if needed
                    "Accept": "application/json",
                },
                credentials: "include", // Include if you're using cookies
                body: JSON.stringify({ name: newBoardName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to create board");
            }

            const newBoard = await response.json();
            console.log("Successfully created board:", newBoard);

            if (typeof onCreateBoard === "function") {
                onCreateBoard(newBoard);
            }
            setNewBoardName("");
        } catch (error) {
            console.error("Error creating board:", error);
            alert(error.message || "Failed to create board. Please try again.");
        }
    };

    return (
        <div className="sidebar">
            <h2>Planner</h2>
            <div className="menu">
                <NavLink to="/dashboard" className="menu-item">
                    🏠 Dashboard
                </NavLink>
                <NavLink to="/tasks" className="menu-item">
                    ✅ Tasks
                </NavLink>
                <NavLink to="/programs" className="menu-item">
                    📅 Programs
                </NavLink>
            </div>
            <h3>Your Boards</h3>
            <ul className="group-list">
                {boards.map((board) => (
                    <li key={board.id}>
                        <NavLink to={`/board/${board.id}`} className="menu-item">
                            {board.name}
                        </NavLink>
                    </li>
                ))}
            </ul>
            <form className="create-board" onSubmit={handleCreateBoard}>
                <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="Enter new board name"
                />
                <button type="submit">Create Board</button>
            </form>
            <button className="menu-item logout-button">
                <FaSignOutAlt /> Logout
            </button>
        </div>
    );
}

export default Sidebar;
