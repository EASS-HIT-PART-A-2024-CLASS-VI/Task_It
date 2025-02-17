import React, { useEffect, useState } from "react";
import { useParams, Routes, Route, Link } from "react-router-dom";
import {
    Box,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Modal,
    Card,
    CardContent
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import GridViewIcon from "@mui/icons-material/GridView";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BoardDashboard from "./BoardDashboard/BoardDashboard";
import Kanban from "./Kanban/Kanban";
import GridComponent from "./Grid/Grid";
import Schedule from "./Schedule/Schedule";

const Board = () => {
    const { boardId } = useParams();
    const [boardName, setBoardName] = useState("Loading...");
    const [tasks, setTasks] = useState([]);
    const [boardUsers, setBoardUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);

    const token = localStorage.getItem("token");

    // 📌 Fetch Board Details (Including Name)
    useEffect(() => {
        fetch(`http://localhost:8000/api/groups/${boardId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(data => {
                console.log("📌 Board Details:", data);
                setBoardName(data.name || "Untitled Board");
            })
            .catch(error => {
                console.error("❌ Error fetching board details:", error);
                setBoardName("Error Loading");
            });
    }, [boardId, token]);

    // 📌 Fetch Board Users
    useEffect(() => {
        fetch(`http://localhost:8000/api/groups/${boardId}/users`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(data => {
                console.log("📌 Board Users:", data);
                setBoardUsers(Array.isArray(data) ? data : []);
            })
            .catch(error => {
                console.error("❌ Error fetching board users:", error);
                setBoardUsers([]);
            });
    }, [boardId, token]);

    // 📌 Fetch All Registered Users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8000/api/users", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });
    
                if (!response.ok) throw new Error("Failed to fetch users");
    
                const data = await response.json();
                console.log("📌 Registered Users:", data);  // Debugging
                setAllUsers(data);  // Store registered users in state
            } catch (error) {
                console.error("❌ Error fetching registered users:", error);
            }
        };
    
        fetchUsers();
    }, []);
    
    // 📌 Add User to Board
    const handleAddUser = async (userId) => {
        if (boardUsers.some(user => user.id === userId)) {
            alert("User is already in the board!");
            return;
        }
    
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/groups/${boardId}/add_user/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
    
            if (!response.ok) throw new Error("Failed to add user");
    
            const updatedUser = allUsers.find(user => user.id === userId);
            setBoardUsers([...boardUsers, updatedUser]);
            setShowUserList(false);
        } catch (error) {
            console.error("Error adding user:", error);
            alert("Could not add user.");
        }
    };
    
    // 📌 Remove User from Board
    const handleRemoveUser = async (userId) => {
        try {
            const token = localStorage.getItem("token");
    
            const response = await fetch(`http://localhost:8000/api/groups/${boardId}/remove_user/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (!response.ok) throw new Error("Failed to remove user");
    
            // Update UI
            setBoardUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } catch (error) {
            console.error("Error removing user:", error);
            alert("Could not remove user.");
        }
    };
    
    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            {/* 📌 Sidebar */}
            <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" } }}>
                <Typography variant="h6" sx={{ textAlign: "center", marginY: 2 }}>
                    {boardName}
                </Typography>
                <List>
                    <ListItem button component={Link} to={`/board/${boardId}/dashboard`}>
                        <ListItemIcon><DashboardIcon /></ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button component={Link} to={`/board/${boardId}/kanban`}>
                        <ListItemIcon><ViewKanbanIcon /></ListItemIcon>
                        <ListItemText primary="Kanban" />
                    </ListItem>
                    <ListItem button component={Link} to={`/board/${boardId}/grid`}>
                        <ListItemIcon><GridViewIcon /></ListItemIcon>
                        <ListItemText primary="Grid" />
                    </ListItem>
                    <ListItem button component={Link} to={`/board/${boardId}/schedule`}>
                        <ListItemIcon><CalendarMonthIcon /></ListItemIcon>
                        <ListItemText primary="Schedule" />
                    </ListItem>
                </List>

                {/* 📌 User List */}
                <Typography variant="h6" sx={{ textAlign: "center", marginY: 2 }}>Users</Typography>
                <List>
                    {boardUsers.map(user => (
                        <ListItem key={user._id}>
                            <ListItemText primary={user.username} />
                            <Button color="secondary" onClick={() => handleRemoveUser(user._id)}>Remove</Button>
                        </ListItem>
                    ))}
                </List>

                {/* 📌 Add User Button */}
                <Button variant="contained" onClick={() => setShowUserList(true)}>➕ Add Users</Button>

                {/* 📌 User Selection Modal */}
                <Modal open={showUserList} onClose={() => setShowUserList(false)}>
                    <Card sx={{ padding: 2, maxWidth: 400, margin: "auto", marginTop: "10%" }}>
                        <CardContent>
                            <Typography variant="h6">Select Users to Add</Typography>
                            <List>
                                {allUsers
                                    .filter(user => !boardUsers.some(boardUser => boardUser.id === user.id)) // Hide added users
                                    .map(user => (
                                        <ListItem key={user.id} button onClick={() => handleAddUser(user.id)}>
                                            <ListItemText primary={`${user.username} (${user.email})`} />
                                        </ListItem>
                                    ))
                                }
                            </List>


                        </CardContent>
                    </Card>
                </Modal>
            </Drawer>

            {/* 📌 Main Content */}
            <Box sx={{ flexGrow: 1, padding: 3 }}>
                <Routes>
                    <Route path="dashboard" element={<BoardDashboard tasks={tasks} />} />
                    <Route path="kanban" element={<Kanban tasks={tasks} />} />
                    <Route path="grid" element={<GridComponent tasks={tasks} />} />
                    <Route path="schedule" element={<Schedule tasks={tasks} />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default Board;
