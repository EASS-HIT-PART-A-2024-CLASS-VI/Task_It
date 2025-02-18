import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const [boards, setBoards] = useState([]);
    const [newBoardName, setNewBoardName] = useState("");
    const userId = localStorage.getItem("userId");
    console.log("🔑 User ID from LocalStorage:", userId);
    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("❌ No JWT token found! User not authenticated.");
                    alert("User is not authenticated!");
                    return;
                }
        
                console.log("🛠️ JWT Token from LocalStorage:", token); // ✅ Debugging
        
                const response = await fetch("http://localhost:8000/api/groups/", {
                    method: "GET",
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
        
                if (!response.ok) {
                    throw new Error("Failed to fetch groups!");
                }
        
                const data = await response.json();
                setBoards(data);
            } catch (error) {
                console.error("Error fetching groups:", error);
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
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("User not authenticated!");
            }
    
            const payload = { name: newBoardName };
    
            const response = await fetch("http://localhost:8000/api/groups/", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to create board");
            }
    
            const newBoard = await response.json();
            console.log("✅ Board created:", newBoard);
    
            // ✅ Update UI immediately without needing a refresh
            setBoards((prevBoards) => [
                ...prevBoards,
                { id: newBoard.group_id, name: newBoardName }
            ]);
    
            setNewBoardName(""); // ✅ Reset input field
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
                <button type="submit" className="create-board-button">
                    Create Board
                </button>
                {/* Log out button */}
                <button
                    type="button"
                    className="logout-button"
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                >
                    Log Out
                </button>
            </form>
        </div>
    );
}

export default Sidebar;