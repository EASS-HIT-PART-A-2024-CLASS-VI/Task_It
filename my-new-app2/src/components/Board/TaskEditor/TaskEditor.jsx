import React, { useState, useEffect } from "react";
import {
    Box, Typography, Paper, Button, TextField, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";

const TaskEditor = ({ task, onClose, onUpdate }) => {
    const [updatedTask, setUpdatedTask] = useState(task);

    useEffect(() => {
        setUpdatedTask(task);
    }, [task]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedTask((prevTask) => ({ ...prevTask, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTask),
            });

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            const updatedData = await response.json();
            onUpdate(updatedData); // ✅ Pass updated task back to Kanban
            onClose(); // ✅ Close the editor
        } catch (error) {
            console.error("Error updating task:", error);
            alert(error.message);
        }
    };

    return (
        <Paper elevation={4} sx={{ padding: 3, maxWidth: 500, margin: "auto", backgroundColor: "white" }}>
            <Typography variant="h6">Edit Task</Typography>
            <TextField fullWidth label="Title" name="title" value={updatedTask.title} onChange={handleChange} margin="dense" />
            <TextField fullWidth label="Description" name="description" multiline rows={3} value={updatedTask.description} onChange={handleChange} margin="dense" />

            <FormControl fullWidth margin="dense">
                <InputLabel>Priority</InputLabel>
                <Select name="priority" value={updatedTask.priority} onChange={handleChange}>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
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
