import React, { useEffect, useState } from "react";
import { useParams, Routes, Route, Link, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    IconButton,
    Menu,
    MenuItem,
    TextField
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import GridViewIcon from "@mui/icons-material/GridView";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import BoardDashboard from "./BoardDashboard/BoardDashboard";
import Kanban from "./Kanban/Kanban";
import Grid from "./Grid/Grid";
import Schedule from "./Schedule/Schedule";

const Board = () => {
    const { boardId } = useParams();
    const [boardName, setBoardName] = useState(""); // Stores board name
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Fetch board details and users
    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/groups/${boardId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch board details");
                }
                const boardData = await response.json();
                setBoardName(boardData.name);
            } catch (error) {
                console.error("Error fetching board:", error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/users/");
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                setUsers(await response.json());
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchBoard();
        fetchUsers();
    }, [boardId]);

    // Open user selection menu
    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Close user selection menu
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    // Assign user to board
    const handleAssignUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/groups/${boardId}/add_user`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId }),
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to assign user");
            }

            alert("User assigned successfully!");
            handleCloseMenu();
        } catch (error) {
            console.error("Error assigning user:", error);
            alert(error.message || "Failed to assign user.");
        }
    };

    // Enable editing mode
    const handleEditName = () => {
        setIsEditing(true);
    };

    // Handle renaming on input change
    const handleNameChange = (event) => {
        setBoardName(event.target.value);
    };

    // Save new board name when Enter is pressed
    const handleKeyDown = async (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            await handleSaveName();
        }
    };

    // Save new board name
    const handleSaveName = async () => {
        setIsEditing(false);

        try {
            const response = await fetch(`http://localhost:8000/api/groups/${boardId}/rename`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: boardName }),
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to rename board");
            }

            alert("Board name updated successfully!");
        } catch (error) {
            console.error("Error updating board name:", error);
            alert("Failed to rename board.");
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Back to Main Dashboard Button */}
            <Box sx={{ padding: 2, textAlign: "left" }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Main Dashboard
                </Button>
            </Box>

            {/* Sidebar and Content */}
            <Box sx={{ display: "flex", flexGrow: 1 }}>
                {/* Sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: 240,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" },
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
                        {/* Editable Board Name */}
                        {isEditing ? (
                            <TextField
                                value={boardName}
                                onChange={handleNameChange}
                                onBlur={handleSaveName}
                                onKeyDown={handleKeyDown} // Save on Enter key press
                                autoFocus
                                size="small"
                                fullWidth
                            />
                        ) : (
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                {boardName}
                            </Typography>
                        )}

                        {/* Edit Button */}
                        {!isEditing && (
                            <IconButton onClick={handleEditName} color="primary">
                                <EditIcon />
                            </IconButton>
                        )}

                        {/* User Assignment Button */}
                        <IconButton onClick={handleOpenMenu} color="primary">
                            <PersonAddIcon />
                        </IconButton>

                        {/* Dropdown for selecting a user */}
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <MenuItem key={user.id} onClick={() => handleAssignUser(user.id)}>
                                        {user.username} ({user.email})
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No users found</MenuItem>
                            )}
                        </Menu>
                    </Box>

                    <List>
                        <ListItem button component={Link} to={`/board/${boardId}/dashboard`}>
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem button component={Link} to={`/board/${boardId}/kanban`}>
                            <ListItemIcon>
                                <ViewKanbanIcon />
                            </ListItemIcon>
                            <ListItemText primary="Kanban" />
                        </ListItem>
                        <ListItem button component={Link} to={`/board/${boardId}/grid`}>
                            <ListItemIcon>
                                <GridViewIcon />
                            </ListItemIcon>
                            <ListItemText primary="Grid" />
                        </ListItem>
                        <ListItem button component={Link} to={`/board/${boardId}/schedule`}>
                            <ListItemIcon>
                                <CalendarMonthIcon />
                            </ListItemIcon>
                            <ListItemText primary="Schedule" />
                        </ListItem>
                    </List>
                </Drawer>

                {/* Main Content */}
                <Box sx={{ flexGrow: 1, padding: 3 }}>
                    <Routes>
                        <Route path="dashboard" element={<BoardDashboard tasks={tasks} />} />
                        <Route path="kanban" element={<Kanban tasks={tasks} />} />
                        <Route path="grid" element={<Grid tasks={tasks} />} />
                        <Route path="schedule" element={<Schedule tasks={tasks} />} />
                    </Routes>
                </Box>
            </Box>
        </Box>
    );
};

export default Board;