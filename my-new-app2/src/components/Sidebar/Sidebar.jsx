import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, ListItemSecondaryAction } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "./Sidebar.css";


function Sidebar() {
    const [boards, setBoards] = useState([]);
    const [newBoardName, setNewBoardName] = useState("");
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const userId = localStorage.getItem("userId");
    const decodedToken = JSON.parse(localStorage.getItem("user") || "{}");

    console.log("🔑 User ID from LocalStorage:", userId);
    console.log("🔑 Decoded Token from LocalStorage:", decodedToken);
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
       // ✅ Open Delete Confirmation Dialog
       const handleOpenDeleteDialog = (board) => {
        setSelectedBoard(board);
        setOpenDialog(true);
    };

    // ✅ Close Dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedBoard(null);
    };

    // ✅ Handle Board Deletion
    const handleDeleteBoard = async () => {
        if (!selectedBoard) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/groups/${selectedBoard.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to delete board");
            }

            // ✅ Remove board from UI
            setBoards((prevBoards) => prevBoards.filter((b) => b.id !== selectedBoard.id));
            handleCloseDialog();
        } catch (error) {
            console.error("Error deleting board:", error);
            alert("Could not delete the board.");
        }
    };
    
    return (
        <div className="sidebar">
        {/* Header: Planner + Avatar */}
        <div className="sidebar-header">
            <h2>Planner</h2>
            <div className="avatar-container">
                <img 
                    src={`http://localhost:8000${decodedToken.photo}`} 
                    alt="User Avatar" 
                    className="avatar"
                />
            </div>
        </div>
            <div className="menu">
                <NavLink to="/dashboard" className="menu-item">
                    🏠 Dashboard
                </NavLink>
                <NavLink to="/tasks" className="menu-item">
                    ✅ Tasks
                </NavLink>
                <NavLink to="/Schedule" className="menu-item">
                    📅 Schedule
                </NavLink>
            </div>
            <h3>Your Boards</h3>
            <List>
                {boards.length > 0 ? (
                    boards.map((board) => (
                        <ListItem key={board.id} button component={NavLink} to={`/board/${board.id}`} className="menu-item">
                            <ListItemText primary={board.name} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(board)}>
                                    <DeleteIcon color="error" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))
                ) : (
                    <p>No boards found. Create one!</p>
                )}
            </List>
            <div>
            {/* ✅ Confirmation Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Delete Board</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the board <strong>{selectedBoard?.name}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                    <Button onClick={handleDeleteBoard} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
            </div>
                {/* Create Board Form */}
                <form className="create-board" onSubmit={handleCreateBoard}>
                    <input
                        type="text"
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        placeholder="Enter new board name"
                        className="input-field"
                    />
                    <button type="submit" className="logout-button">
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