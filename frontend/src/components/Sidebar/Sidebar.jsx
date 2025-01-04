import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaPlusCircle, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ boards = [], onCreateBoard = () => { } }) {
    const [newBoardName, setNewBoardName] = useState("");

    const handleCreateBoard = () => {
        console.log("handleCreateBoard triggered with:", newBoardName);
        if (!newBoardName.trim()) {
            alert("Board name cannot be empty.");
            return;
        }
        onCreateBoard(newBoardName); // Safe even if `onCreateBoard` is not passed
        setNewBoardName(""); // Clear the input field
    };

    console.log("Boards in Sidebar:", boards);

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
            <div className="create-board">
                <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="Enter new board name"
                />
                <button onClick={handleCreateBoard}>
                    <FaPlusCircle /> New Board
                </button>
            </div>
            <button className="menu-item logout-button">
                <FaSignOutAlt /> Logout
            </button>
        </div>
    );
}

export default Sidebar;
