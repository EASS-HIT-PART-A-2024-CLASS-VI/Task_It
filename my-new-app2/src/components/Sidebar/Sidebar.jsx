import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const [boards, setBoards] = useState([]);
    const [newBoardName, setNewBoardName] = useState("");

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) {
                    console.error("User not logged in!");
                    return;
                }

                const response = await fetch(`http://localhost:8000/api/groups/?created_by=${userId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch boards!");
                }

                const data = await response.json();
                setBoards(data);
            } catch (error) {
                console.error("Error fetching boards:", error);
            }
        };

        fetchBoards();
    }, []);

    const handleCreateBoard = async (e) => {
        e.preventDefault();

        if (!newBoardName.trim()) {
            alert("Board name cannot be empty.");
            return;
        }

        try {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                throw new Error("User not logged in!");
            }

            const payload = { name: newBoardName, created_by: parseInt(userId, 10) };
            const response = await fetch("http://localhost:8000/api/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to create board");
            }

            const newBoard = await response.json();
            setBoards((prevBoards) => [...prevBoards, newBoard]);
            
            setNewBoardName("");
        } catch (error) {
            console.error("Error creating board:", error);
            alert(error.message || "An error occurred while creating the board.");
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
                {boards.length > 0 ? (
                    boards.map((board) => (
                        <li key={board.id}>
                            <NavLink to={`/board/${board.id}`} className="menu-item">
                                {board.name}
                            </NavLink>
                        </li>
                    ))
                ) : (
                    <p>No boards found. Create one!</p>
                )}
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
        </div>
    );
}

export default Sidebar;