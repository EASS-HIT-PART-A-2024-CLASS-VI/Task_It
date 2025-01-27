import React from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";

function Kanban({ tasks, addTask, updateTask }) {
    const handleAddTask = () => {
        const newTask = { id: Date.now(), title: "New Task", status: "Pending" };
        addTask(newTask);
    };

    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 2 }}>
            {tasks.map((task) => (
                <Card key={task.id} sx={{ minWidth: 275 }}>
                    <CardContent>
                        <Typography variant="h5" component="div">
                            {task.title}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            {task.status}
                        </Typography>
                        <Button size="small" onClick={() => updateTask({ ...task, status: "In Progress" })}>
                            Move to In Progress
                        </Button>
                    </CardContent>
                </Card>
            ))}
            <Button variant="contained" onClick={handleAddTask}>
                Add Task
            </Button>
        </Box>
    );
}

export default Kanban;
