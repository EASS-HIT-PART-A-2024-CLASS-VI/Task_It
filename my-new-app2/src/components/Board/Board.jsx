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
    Modal,
    Card,
    CardContent
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import GridViewIcon from "@mui/icons-material/GridView";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BoardDashboard from "./BoardDashboard/BoardDashboard";
import Kanban from "./Kanban/Kanban";
import GridComponent from "./Grid/Grid";
import Schedule from "./Schedule/Schedule";

const Board = () => {
    const { boardId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [boardUsers, setBoardUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:8000/api/groups/${boardId}/users`)
            .then(response => response.json())
            .then(data => setBoardUsers(data))
            .catch(error => console.error("Error fetching board users:", error));
    }, [boardId]);

    useEffect(() => {
        fetch("http://localhost:8000/api/users")
            .then(response => response.json())
            .then(data => setAllUsers(data))
            .catch(error => console.error("Error fetching all users:", error));
    }, []);

    const handleAddUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/groups/${boardId}/add_user/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Failed to add user");

            const updatedUser = allUsers.find(user => user.id === userId);
            setBoardUsers([...boardUsers, updatedUser]);
            setShowUserList(false);
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    const handleRemoveUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/groups/${boardId}/remove_user/${userId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Failed to remove user");

            setBoardUsers(boardUsers.filter(user => user.id !== userId));
        } catch (error) {
            console.error("Error removing user:", error);
        }
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" } }}>
                <Typography variant="h6" sx={{ textAlign: "center", marginY: 2 }}>
                    Board {boardId}
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
                <Typography variant="h6" sx={{ textAlign: "center", marginY: 2 }}>Users</Typography>
                <List>
                    {boardUsers.map(user => (
                        <ListItem key={user.id}>
                            <ListItemText primary={user.username} />
                            <Button color="secondary" onClick={() => handleRemoveUser(user.id)}>Remove</Button>
                        </ListItem>
                    ))}
                </List>
                <Button variant="contained" onClick={() => setShowUserList(true)}>➕ Add Users</Button>
                <Modal open={showUserList} onClose={() => setShowUserList(false)}>
                    <Card sx={{ padding: 2, maxWidth: 400, margin: "auto", marginTop: "10%" }}>
                        <CardContent>
                            <Typography variant="h6">Select Users to Add</Typography>
                            <List>
                                {allUsers.filter(user => !boardUsers.some(boardUser => boardUser.id === user.id)).map(user => (
                                    <ListItem key={user.id} button onClick={() => handleAddUser(user.id)}>
                                        <ListItemText primary={user.username} />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Modal>
            </Drawer>
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
