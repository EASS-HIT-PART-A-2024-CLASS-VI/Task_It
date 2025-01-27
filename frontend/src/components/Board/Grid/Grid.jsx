// Grid.jsx
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";

function Grid({ tasks, addTask, updateTask }) {
    const handleAddTask = () => {
        const newTask = { id: Date.now(), title: "New Task", status: "To Do" };
        addTask(newTask);
    };

    const columns = [
        { field: "id", headerName: "ID", width: 150 },
        { field: "title", headerName: "Title", width: 300 },
        { field: "status", headerName: "Status", width: 200 },
    ];

    return (
        <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
                rows={tasks.map((task) => ({ id: task.id, title: task.title, status: task.status }))}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
            />
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddTask}>
                Add Task
            </Button>
        </Box>
    );
}

export default Grid;
