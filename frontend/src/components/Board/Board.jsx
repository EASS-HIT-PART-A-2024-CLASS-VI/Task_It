import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import BoardDashboard from "./BoardDashboard/BoardDashboard";
import Kanban from "./Kanban/Kanban";
import Grid from "./Grid/Grid";
import Schedule from "./Schedule/Schedule";

const Board = () => {
    const { boardId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [boardInfo, setBoardInfo] = useState(null);
    const [currentView, setCurrentView] = useState("dashboard");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBoardData = async () => {
            try {
                setLoading(true);

                // Fetch tasks
                const tasksResponse = await fetch(`http://localhost:8000/api/boards/${boardId}/tasks`);
                if (!tasksResponse.ok) {
                    throw new Error("Failed to fetch tasks");
                }
                const tasksData = await tasksResponse.json();
                setTasks(tasksData);

                // Fetch board info
                const boardInfoResponse = await fetch(`http://localhost:8000/api/boards/${boardId}/board-info`);
                if (!boardInfoResponse.ok) {
                    throw new Error("Failed to fetch board info");
                }
                const boardInfoData = await boardInfoResponse.json();
                setBoardInfo(boardInfoData);
            } catch (error) {
                console.error("Error fetching board data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBoardData();
    }, [boardId]);

    const handleViewChange = (event, newValue) => {
        setCurrentView(newValue);
    };

    const addTask = (newTask) => {
        setTasks((prevTasks) => [...prevTasks, newTask]);
    };

    const updateTask = (updatedTask) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
    };

    if (loading) {
        return <div>Loading board...</div>;
    }

    if (!boardInfo) {
        return <Typography variant="h6" color="error">
            Board not found.
        </Typography>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {boardInfo.name}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Board ID: {boardInfo.id}
            </Typography>
            <Tabs value={currentView} onChange={handleViewChange} centered>
                <Tab label="Dashboard" value="dashboard" />
                <Tab label="Kanban" value="kanban" />
                <Tab label="Grid" value="grid" />
                <Tab label="Schedule" value="schedule" />
            </Tabs>
            <Box sx={{ mt: 2 }}>
                {currentView === "dashboard" && <BoardDashboard tasks={tasks} />}
                {currentView === "kanban" && <Kanban tasks={tasks} addTask={addTask} updateTask={updateTask} />}
                {currentView === "grid" && <Grid tasks={tasks} addTask={addTask} updateTask={updateTask} />}
                {currentView === "schedule" && <Schedule tasks={tasks} />}
            </Box>
        </Box>
    );
};

export default Board;
