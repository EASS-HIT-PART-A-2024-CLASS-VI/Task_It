import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const [boards, setBoards] = useState([]);
    const [newBoardName, setNewBoardName] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedBoardId, setSelectedBoardId] = useState("");

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

        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/users/");
                if (!response.ok) {
                    throw new Error("Failed to fetch users!");
                }

                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchBoards();
        fetchUsers();
    }, []);

    const handleCreateBoard = async (e) => {
        e.preventDefault();
    
        if (!newBoardName.trim()) {
            alert("Board name cannot be empty.");
            return;
        }
    
        try {
            let userId = localStorage.getItem("userId");
    
            if (!userId) {
                throw new Error("User not logged in! Please log in again.");
            }
    
            userId = parseInt(userId, 10);
            if (isNaN(userId)) {
                throw new Error("Invalid user ID detected! Please log in again.");
            }
    
            const payload = {
                name: newBoardName,
                created_by: userId,  // ✅ Ensure it's a valid number
            };
    
            console.log("Sending payload:", payload);  // ✅ Debugging log
    
            const response = await fetch("http://localhost:8000/api/groups/", {
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
            alert("Board created successfully!");
        } catch (error) {
            console.error("Error creating board:", error);
            alert(error.message || "An error occurred while creating the board.");
        }
    };

    const handleAssignUser = async (e) => {
        e.preventDefault();

        if (!selectedUserId.trim() || !selectedBoardId.trim()) {
            alert("Please select a user and a board.");
            return;
        }

        try {
            console.log(`Assigning User ${selectedUserId} to Board ${selectedBoardId}`);  // ✅ Debugging

            const response = await fetch(`http://localhost:8000/api/groups/${selectedBoardId}/add_user?user_id=${selectedUserId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to assign user");
            }

            alert("User successfully assigned to group!");
            setSelectedUserId("");
            setSelectedBoardId("");
        } catch (error) {
            console.error("Error assigning user:", error);
            alert(error.message || "Failed to assign user.");
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

            {/* Assign User to Group */}
            <h3>Assign User to Group</h3>
            <form className="assign-user-form" onSubmit={handleAssignUser}>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                    <option value="">Select a user</option>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.username} ({user.email})
                            </option>
                        ))
                    ) : (
                        <option disabled>Loading users...</option>
                    )}
                </select>

                <select value={selectedBoardId} onChange={(e) => setSelectedBoardId(e.target.value)}>
                    <option value="">Select a board</option>
                    {boards.length > 0 ? (
                        boards.map((board) => (
                            <option key={board.id} value={board.id}>
                                {board.id} - {board.name}
                            </option>
                        ))
                    ) : (
                        <option disabled>Loading boards...</option>
                    )}
                </select>

                <button type="submit">Assign User</button>
            </form>

            <h3>Your Boards</h3>
            <ul className="group-list">
                {boards.length > 0 ? (
                    boards.map((board) => (
                        <li key={board.id}>
                            <NavLink to={`/board/${board.id}`} className="menu-item">
                                {board.id} - {board.name}
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