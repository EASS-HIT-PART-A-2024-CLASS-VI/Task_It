import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom"; // ✅ Get boardId from URL
import dayjs from "dayjs"; // ✅ Used for date formatting

const GridView = () => {
    const { boardId } = useParams(); // ✅ Get boardId from URL
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem("token");
            if (!boardId || !token) return; // ✅ Ensure token exists

            try {
                const response = await fetch(`http://localhost:8000/api/tasks/?board_id=${boardId}`, {
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });

                console.log("📌 Tasks in GridView:", response); // Debugging log
                if (!response.ok) throw new Error("Failed to fetch tasks");

                let data = await response.json();

                // ✅ Format deadlines & add row number
                data = data.map((task, index) => ({
                    ...task,
                    number: index + 1, // ✅ Row numbering
                    deadline: task.deadline ? dayjs(task.deadline).format("DD-MM-YYYY") : "No Deadline",
                }));
                console.log("📦 Fetched tasks:", data); // Debugging log
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [boardId]);

    const columns = [
        { field: "number", headerName: "#", width: 90 },
        { field: "title", headerName: "Task Name", width: 200 },
        { field: "description", headerName: "Description", width: 300, flex: 1 },
        { field: "status", headerName: "Status", width: 150 },
        { field: "priority", headerName: "Priority", width: 120 },
        {
            field: "assigned_to",
            headerName: "Assigned To",
            width: 200,
            renderCell: (params) => params.row.assigned_to.join(", "),
        },
        
        { field: "deadline", headerName: "Deadline", width: 200 },
    ];

    return (
        <Box
            sx={{
                height: "80vh",
                width: "90%",
                margin: "auto",
                padding: 3,
                backgroundColor: "white",
                borderRadius: 6,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography variant="h4"sx={{
                                marginBottom:"1rem",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center"
                            }}>📑 Task Grid </Typography>
            <Typography variant="body1" gutterBottom sx={{
                                marginBottom:"1rem",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center"
                            }}>
                This view displays all tasks in a structured grid format.
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, overflow: "hidden", justifyContent: "center", alignItems: "center" }}>
                    <DataGrid
                        rows={tasks}
                        columns={columns}
                        pageSize={5}
                    
                        rowsPerPageOptions={[5, 10, 20]}
                        checkboxSelection
                        getRowId={(row) => row.number} // ✅ Use row number instead of ID
                        getRowClassName={(params) => {
                            const priority = params.row.priority || "";
                            return `priority-${priority.toLowerCase()}`;
                        }}
                        sx={{
                            height: "100%",
                            maxHeight: "100%",
                            overflow: "auto",
                            alignContent: "center",
                            justifyContent: "center",
                            "& .priority-high": { backgroundColor: "#ffebee" }, // Red
                            "& .priority-medium": { backgroundColor: "#fff3e0" }, // Orange
                            "& .priority-low": { backgroundColor: "#e8f5e9" }, // Green
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default GridView;
