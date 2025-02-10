import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

const Grid = () => {
    const columns = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "taskName", headerName: "Task Name", width: 150 },
        { field: "status", headerName: "Status", width: 150 },
    ];

    const rows = [
        { id: 1, taskName: "Task 1", status: "Completed" },
        { id: 2, taskName: "Task 2", status: "Pending" },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Grid
            </Typography>
            <Typography variant="body1" gutterBottom>
                This view shows tasks in a grid format.
            </Typography>
            <div style={{ height: 400, width: "100%" }}>
                <DataGrid rows={rows} columns={columns} pageSize={5} />
            </div>
        </Box>
    );
};

export default Grid;