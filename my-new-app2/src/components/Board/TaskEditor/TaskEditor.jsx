import React, { useState, useEffect } from "react";
import {
    Box, Typography, Paper, Button, TextField, MenuItem, 
    Select, FormControl, InputLabel, Alert
} from "@mui/material";

const TaskEditor = ({ task, onClose, onUpdate, token }) => {
    const [updatedTask, setUpdatedTask] = useState({
        id: "",  // Added id field
        title: "",
        description: "",
        priority: "Medium",
        status: "Not Started",
        assigned_to: [],
        deadline: "",
        board_id: null,
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [boardUsers, setBoardUsers] = useState([]);
    const boardId = task ? task.board_id : null;


    useEffect(() => {
        if (task) {
            console.log("📌 Loaded Task in Editor:", task);  // Debugging log
            setUpdatedTask({
                ...task,
                deadline: task.deadline ? task.deadline : "", // Avoid unnecessary parsing
                assigned_to: Array.isArray(task.assigned_to) ? task.assigned_to : [], // Ensure array
            });
        }
    }, [task],[task?.assigned_to]);
    
    useEffect(() => {
        fetch(`http://localhost:8000/api/groups/${boardId}/users`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => setBoardUsers(Array.isArray(data) ? data : []))
        .catch(error => console.error("❌ Error fetching board users:", error));
    }, [boardId, token]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedTask(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSave = async () => {
        if (!updatedTask.title.trim()) {
            setError("Title is required");
            return;
        }
    
        setSaving(true);
        try {
            // ✅ Ensure deadline is sent in `YYYY-MM-DD` format
            const formattedDeadline = updatedTask.deadline 
                ? new Date(updatedTask.deadline).toISOString().split('T')[0] // 🔥 Extracts `YYYY-MM-DD`
                : null;
    
            const updatePayload = {
                id: updatedTask.id,
                title: updatedTask.title,
                description: updatedTask.description,
                status: updatedTask.status,
                priority: updatedTask.priority,
                assigned_to: updatedTask.assigned_to,
                deadline: formattedDeadline,  // ✅ Correct format
            };
    
            console.log("📌 Sending Task Update:", updatePayload);
    
            await onUpdate(updatePayload);
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };
    
    

    return (
        <Paper 
            elevation={4} 
            sx={{ 
                p: 3,
                maxWidth: 500,
                margin: "auto",
                backgroundColor: "background.paper"
            }}
        >
            <Typography variant="h6" sx={{ mb: 2 }}>Edit Task</Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <TextField
                fullWidth
                label="Title"
                name="title"
                value={updatedTask.title}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
            />
            
            <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={updatedTask.description}
                onChange={handleChange}
                sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                    name="priority"
                    value={updatedTask.priority}
                    onChange={handleChange}
                    label="Priority"
                >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                    name="status"
                    value={updatedTask.status}
                    onChange={handleChange}
                    label="Status"
                >
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
                value={updatedTask.deadline || ""}  // Ensure empty string instead of undefined
                onChange={handleChange}
                sx={{ mb: 2 }}
            />


            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Assign To</InputLabel>
                <Select
                    multiple
                    name="assigned_to"
                    value={updatedTask.assigned_to || []}  // ✅ Ensure it's always an array
                    onChange={(e) => {
                        const selectedUsers = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                        setUpdatedTask({ ...updatedTask, assigned_to: selectedUsers });
                    }}
                    renderValue={(selected) =>
                        selected.map(userId => {
                            const user = boardUsers.find(u => u.id === userId);
                            return user ? user.username : userId;
                        }).join(", ")
                    }
                >

                    {boardUsers.map(user => (
                        <MenuItem key={user.id} value={user.id}>
                            {user.username} ({user.email})
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>


            <Box display="flex" justifyContent="space-between">
                <Button 
                    onClick={onClose} 
                    color="secondary" 
                    disabled={saving}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    color="primary"
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save"}
                </Button>
            </Box>
        </Paper>
    );
};

export default TaskEditor;