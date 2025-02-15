import React, { useState, useEffect } from "react";
import {
    Box, Typography, Paper, Button, TextField, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";

const TaskEditor = ({ task, onClose, onUpdate = () => {} }) => {
    const [updatedTask, setUpdatedTask] = useState({ 
        title: "", 
        description: "", 
        priority: "Medium", 
        status: "Pending",
        assigned_to: "",
        deadline: "",
        board_id: null,
    });

    const [assignedUsers, setAssignedUsers] = useState([]);

    useEffect(() => {
        if (task) {
            setUpdatedTask({
                ...task,
                status: task.status === "Pending" ? "Not Started" : task.status,
            });

            fetchAssignedUsers(task.board_id);
        }
    }, [task]);

    const fetchAssignedUsers = async (boardId) => {
        if (!boardId) return;

        try {
            const response = await fetch(`http://localhost:8000/api/tasks/assigned_users/${boardId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch assigned users!");
            }

            const data = await response.json();
            setAssignedUsers(data);
        } catch (error) {
            console.error("Error fetching assigned users:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedTask((prevTask) => ({ ...prevTask, [name]: value }));
    };

    const handleSave = async () => {
        if (!updatedTask.title.trim()) {
            alert("Task title cannot be empty.");
            return;
        }

        try {
            const payload = {
                title: updatedTask.title,
                description: updatedTask.description,
                priority: updatedTask.priority,
                status: updatedTask.status,
                deadline: updatedTask.deadline || null,
                assigned_to: updatedTask.assigned_to || null,
                board_id: updatedTask.board_id || task.board_id,
            };

            const response = await fetch(`http://localhost:8000/api/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            const updatedData = await response.json();
            console.log("Updated task:", updatedData);

            if (typeof onUpdate === "function") {
                onUpdate(updatedData);
            }

            onClose();
        } catch (error) {
            console.error("Error updating task:", error);
            alert(error.message);
        }
    };

    return (
        <Paper elevation={4} sx={{ padding: 3, maxWidth: 500, margin: "auto", backgroundColor: "white" }}>
            <Typography variant="h6">Edit Task</Typography>
            
            <TextField
                fullWidth
                label="Title"
                name="title"
                value={updatedTask.title}
                onChange={handleChange}
                margin="dense"
            />
            
            <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={updatedTask.description}
                onChange={handleChange}
                margin="dense"
            />

            <FormControl fullWidth margin="dense">
                <InputLabel>Priority</InputLabel>
                <Select name="priority" value={updatedTask.priority} onChange={handleChange}>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select name="status" value={updatedTask.status} onChange={handleChange}>
                    <MenuItem value="Not Started">Not Started</MenuItem>
                    <MenuItem value="Working on It">Working on It</MenuItem>
                    <MenuItem value="Done">Done</MenuItem>
                </Select>
            </FormControl>

            <TextField
                fullWidth
                type="date"
                label="Deadline"
                name="deadline"
                InputLabelProps={{ shrink: true }}
                value={updatedTask.deadline || ""}
                onChange={handleChange}
                margin="dense"
            />

            <FormControl fullWidth margin="dense">
                <InputLabel>Assigned To</InputLabel>
                <Select
                    name="assigned_to"
                    value={updatedTask.assigned_to || ""}
                    onChange={handleChange}
                >
                    <MenuItem value="">Unassigned</MenuItem>
                    {assignedUsers.map((user) => (
                        <MenuItem key={user.id} value={user.username}>
                            {user.username}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box display="flex" justifyContent="space-between" mt={2}>
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
            </Box>
        </Paper>
    );
};

export default TaskEditor;