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
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import GridViewIcon from "@mui/icons-material/GridView";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BoardDashboard from "./BoardDashboard/BoardDashboard";
import Kanban from "./Kanban/Kanban";
import Grid from "./Grid/Grid";
import Schedule from "./Schedule/Schedule";

const Board = () => {
    const { boardId } = useParams();
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate(); // Hook for navigation

    

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Back to Main Dashboard Button */}
            <Box sx={{ padding: 2, textAlign: "left" }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/dashboard")} // Navigate back to the main dashboard
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
                    <Typography variant="h6" sx={{ textAlign: "center", marginY: 2 }}>
                        Board {boardId}
                    </Typography>
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
