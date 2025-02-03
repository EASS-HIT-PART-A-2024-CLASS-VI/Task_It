import React, { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Paper, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const Kanban = () => {
    const { boardId } = useParams(); // קבלת boardId מהנתיב
    console.log("Board ID received:", boardId);

    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "" });
    const [showForm, setShowForm] = useState(false);

    // טעינת משימות מהשרת
    const fetchTasks = useCallback(async () => {
        if (!boardId || boardId === "undefined") {
            console.error("Error: Board ID is undefined, cannot fetch tasks.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/groups/${boardId}/tasks`);
            if (!response.ok) throw new Error("Failed to fetch tasks");
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }, [boardId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // יצירת משימה חדשה
    const handleCreateTask = async (e) => {
        e.preventDefault();

        if (!boardId || boardId === "undefined") {
            alert("Error: Board ID is missing!");
            return;
        }

        try {
            const payload = {
                title: newTask.title,
                description: newTask.description,
                status: "Not Started",
                assigned_to: newTask.assignedTo || null,
                deadline: null
            };

            console.log("Sending payload:", payload);

            const response = await fetch(`http://localhost:8000/api/groups/${boardId}/tasks`, {
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
            setNewTask({ title: "", description: "", assignedTo: "" });
            setShowForm(false);
        } catch (error) {
            console.error("Error creating task:", error);
            alert(error.message || "An error occurred while creating the task.");
        }
    };

    // שינוי סטטוס משימה בגרירה ושחרור
    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const taskId = result.draggableId;
        const newStatus = result.destination.droppableId;

        try {
            await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            setTasks((prev) =>
                prev.map((task) => (task.id === parseInt(taskId) ? { ...task, status: newStatus } : task))
            );
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    const statuses = ["Not Started", "Working on It", "Done"];

    return (
        <Box sx={{ padding: 3, backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
            <Typography variant="h3" sx={{ textAlign: "center", color: "#333", mb: 3 }}>
                Kanban Board - Board {boardId}
            </Typography>

            <Box textAlign="center" mb={3}>
                <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "Add Task"}
                </Button>
            </Box>

            {showForm && (
                <Paper elevation={4} sx={{ padding: 3, maxWidth: 500, margin: "auto", backgroundColor: "white" }}>
                    <Typography variant="h6">Create New Task</Typography>
                    <form onSubmit={handleCreateTask}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            margin="dense"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            margin="dense"
                        />
                        <Box display="flex" justifyContent="space-between" mt={2}>
                            <Button onClick={() => setShowForm(false)} color="secondary">Cancel</Button>
                            <Button type="submit" variant="contained" color="primary">Create</Button>
                        </Box>
                    </form>
                </Paper>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Grid container spacing={2} justifyContent="center">
                    {statuses.map((status) => (
                        <Grid item xs={12} md={4} key={status}>
                            <Paper elevation={3} sx={{ padding: 2, backgroundColor: "#ffffff", minHeight: "400px" }}>
                                <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>{status}</Typography>
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
                                                                    borderRadius: "8px",
                                                                }}
                                                            >
                                                                <Typography>{task.title}</Typography>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    {task.description}
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
        </Box>
    );
};

export default Kanban;
