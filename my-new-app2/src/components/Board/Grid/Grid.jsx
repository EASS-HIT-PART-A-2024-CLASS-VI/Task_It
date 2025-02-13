import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, CircularProgress } from "@mui/material";

const GridView = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/tasks/");
                if (!response.ok) {
                    throw new Error("Failed to fetch tasks");
                }
                const data = await response.json();
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "title", headerName: "Task Name", width: 200 },
        { field: "description", headerName: "Description", width: 300, flex: 1 }, // ✅ Added description column
        { field: "status", headerName: "Status", width: 150 },
        { field: "priority", headerName: "Priority", width: 120 },
        { field: "assigned_to", headerName: "Assigned To", width: 150 },
        {
            field: "deadline",
            headerName: "Deadline",
            width: 150,
            type: "date",
            valueGetter: (params) => {
                if (!params || !params.row) return null;
                if (!params.row.deadline) return null;

                try {
                    const parsedDate = new Date(params.row.deadline);
                    return isNaN(parsedDate.getTime()) ? null : parsedDate;
                } catch (error) {
                    console.error("Error parsing date:", params.row.deadline);
                    return null;
                }
            },
        },
    ];

    return (
        <Box
            sx={{
                height: "80vh",
                width: "90%",
                margin: "auto",
                padding: 3,
                backgroundColor: "white",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography variant="h4" gutterBottom>
                Task Grid View
            </Typography>
            <Typography variant="body1" gutterBottom>
                This view displays all tasks in a structured grid format.
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                    <DataGrid
                        rows={tasks}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        checkboxSelection
                        sx={{
                            height: "100%",
                            maxHeight: "100%",
                            overflow: "auto",
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default GridView;
