import React, { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Paper, Grid, Button, IconButton, TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskEditor from "../TaskEditor/TaskEditor"; // ✅ Import Task Editor component

const Kanban = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null); // ✅ Track selected task for editing
    const [showForm, setShowForm] = useState(null);
    const [newTask, setNewTask] = useState({ title: "", description: "", status: "Not Started", priority: "Medium" });

    const fetchTasks = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8000/api/tasks");
            if (!response.ok) throw new Error("Failed to fetch tasks");
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

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
                board_id: 1 // ✅ Replace with actual board ID
            };

            console.log("Sending payload:", payload);

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
            setNewTask({ title: "", description: "", status: "Not Started", priority: "Medium" });
        } catch (error) {
            console.error("Error creating task:", error);
            alert(error.message || "An error occurred while creating the task.");
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task); // ✅ Open editor when clicking a task
    };

    const handleUpdateTask = (updatedTask) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const taskId = result.draggableId;
        const newStatus = result.destination.droppableId;

        try {
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
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

    const statuses = ["Not Started", "Working on It", "Done"];

    return (
        <Box sx={{ padding: 3, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <Typography variant="h3" sx={{ textAlign: "center", color: "#333", mb: 3 }}>
                Kanban Board
            </Typography>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Grid container spacing={2} justifyContent="center">
                    {statuses.map((status) => (
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
                                                                    backgroundColor: "#e3f2fd",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() => handleTaskClick(task)}
                                                            >
                                                                <Typography>{task.title}</Typography>
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

            {/* ✅ Show TaskEditor Modal if a task is selected */}
            {selectedTask && (
                <TaskEditor task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateTask} />
            )}
        </Box>
    );
};

export default Kanban;
