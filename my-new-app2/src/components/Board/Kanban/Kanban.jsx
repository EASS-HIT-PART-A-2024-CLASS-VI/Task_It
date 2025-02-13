import React, { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Paper, Grid, IconButton, Backdrop, TextField, Button, Modal
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams } from "react-router-dom";
import TaskEditor from "../TaskEditor/TaskEditor";

const Kanban = () => {
    const { boardId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newTask, setNewTask] = useState({ title: "", description: "", priority: "Medium" });
    const [showForm, setShowForm] = useState(null);
    const [taskMetrics, setTaskMetrics] = useState({ total: 0, notStarted: 0, working: 0, done: 0 });

    const fetchTasks = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/tasks?board_id=${boardId}`);
            if (!response.ok) throw new Error("Failed to fetch tasks");
            const data = await response.json();
            setTasks(data);

            // ✅ Update task metrics
            const notStarted = data.filter(task => task.status === "Not Started").length;
            const working = data.filter(task => task.status === "Working on It").length;
            const done = data.filter(task => task.status === "Done").length;

            setTaskMetrics({
                total: data.length,
                notStarted,
                working,
                done,
            });
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }, [boardId]);

    useEffect(() => {
        if (boardId) fetchTasks();
    }, [fetchTasks, boardId]);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const taskId = result.draggableId;
        const newStatus = result.destination.droppableId;

        const taskToUpdate = tasks.find(task => String(task.id) === taskId);
        if (!taskToUpdate) return;

        try {
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: taskToUpdate.title,
                    description: taskToUpdate.description,
                    priority: taskToUpdate.priority,
                    status: newStatus,
                    deadline: taskToUpdate.deadline || null,
                    board_id: taskToUpdate.board_id, // ✅ Send board_id
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update task status");
            }

            const updatedTask = await response.json();
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
            );
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    const handleCreateTask = async (status) => {
        if (!newTask.title.trim()) {
            alert("Task title cannot be empty.");
            return;
        }

        try {
            const payload = {
                title: newTask.title.trim(),
                description: newTask.description.trim(),
                status: status,
                priority: newTask.priority,
                board_id: Number(boardId) // ✅ Pass correct boardId
            };

            const response = await fetch(`http://localhost:8000/api/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to create task");
            }

            const newTaskData = await response.json();
            setTasks((prevTasks) => [...prevTasks, newTaskData]);
            setShowForm(null);
            setNewTask({ title: "", description: "", priority: "Medium" });
        } catch (error) {
            console.error("Error creating task:", error);
            alert(error.message || "An error occurred while creating the task.");
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High": return "#ff6b6b"; // Red
            case "Medium": return "#ffcc00"; // Yellow
            case "Low": return "#66b3ff"; // Blue
            default: return "#f5f5f5"; // Default
        }
    };

    return (
        <Box sx={{ padding: 3, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <Typography variant="h3" sx={{ textAlign: "center", color: "#333", mb: 3 }}>
                Kanban Board - Board ID {boardId}
            </Typography>

            {/* ✅ Task Metrics Section */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 3 }}>
                <Typography variant="h6">Total: {taskMetrics.total}</Typography>
                <Typography variant="h6">Not Started: {taskMetrics.notStarted}</Typography>
                <Typography variant="h6">Working on It: {taskMetrics.working}</Typography>
                <Typography variant="h6">Done: {taskMetrics.done}</Typography>
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Grid container spacing={2} justifyContent="center">
                    {["Not Started", "Working on It", "Done"].map((status) => (
                        <Grid item xs={12} md={4} key={status}>
                            <Paper elevation={3} sx={{ padding: 2, backgroundColor: "#ffffff", minHeight: "400px" }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">{status}</Typography>
                                    <IconButton size="small" onClick={() => setShowForm(status)}>
                                        <AddIcon />
                                    </IconButton>
                                </Box>

                                <Droppable droppableId={status}>
                                    {(provided) => (
                                        <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ minHeight: "300px" }}>
                                            {tasks
                                                .filter((task) => task.status === status)
                                                .map((task, index) => (
                                                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                                        {(provided) => (
                                                            <Paper
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                sx={{
                                                                    padding: 2,
                                                                    marginBottom: 1,
                                                                    backgroundColor: getPriorityColor(task.priority),
                                                                    cursor: "pointer",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "space-between",
                                                                }}
                                                                onClick={() => handleTaskClick(task)}
                                                            >
                                                                <Typography>
                                                                    {status === "Done" && <CheckCircleIcon sx={{ color: "green", mr: 1 }} />}
                                                                    {task.title}
                                                                </Typography>
                                                            </Paper>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            {provided.placeholder}
                                        </Box>
                                    )}
                                </Droppable>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </DragDropContext>

            {showForm && (
                <Modal open={true} onClose={() => setShowForm(null)}>
                    <Box sx={{ backgroundColor: "white", padding: 3, margin: "auto", maxWidth: 400 }}>
                        <Typography variant="h6">Create Task</Typography>
                        <TextField fullWidth label="Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} margin="dense" />
                        <Button variant="contained" onClick={() => handleCreateTask(showForm)}>Create</Button>
                    </Box>
                </Modal>
            )}

            {selectedTask && (
                <Backdrop open={true} onClick={() => setSelectedTask(null)}>
                    <TaskEditor task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={fetchTasks} />
                </Backdrop>
            )}
        </Box>
    );
};

export default Kanban;
