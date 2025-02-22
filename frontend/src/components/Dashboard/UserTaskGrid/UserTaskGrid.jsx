import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Paper,Typography } from "@mui/material";
import dayjs from "dayjs";

const TasksGrid = () => {
    const decodedToken = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = decodedToken.user_id;
    console.log("🔑 Decoded Token from LocalStorage:", decodedToken);

    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!userId) {
                console.error("❌ No userId found in decoded token!");
                return;
            }

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("❌ No token found!");
                    return;
                }

                console.log("Fetching tasks for userId:", userId);

                const response = await fetch(`http://localhost:8000/api/tasks/user/${userId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch tasks.");
                }

                let data = await response.json();
                console.log("✅ Tasks fetched:", data);
                // ✅ Format deadlines & add row number
                data = data.map((tasks, index) => ({
                    ...tasks,
                    number: index + 1, // ✅ Row numbering
                    deadline: tasks.deadline ? dayjs(tasks.deadline).format("DD-MM-YYYY") : "No Deadline",
                }));
                setTasks(data);
            } catch (error) {
                console.error("❌ Error fetching tasks:", error);
            }
        };

        fetchTasks();
    }, [userId]);

    // ✅ Define MUI table columns
    const columns = [
        { field: "number", headerName: "#", flex: 0.5, minWidth: 50 }, // ✅ Row Number
        { field: "title", headerName: "Title", flex: 1, minWidth: 150 },
        { field: "description", headerName: "Description", flex: 2, minWidth: 250 },
        { field: "status", headerName: "Status", flex: 1, minWidth: 120 },
        { field: "priority", headerName: "Priority", flex: 1, minWidth: 120 },
        { field: "board_Name", headerName: "Board", flex: 1, minWidth: 150 }, // ✅ Board Name instead of ID
        { field: "deadline", headerName: "Deadline", flex: 1, minWidth: 150 }
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
                marginRight:"-10%"
            }}
        >
            <Typography variant="h4"sx={{
                marginBottom:"1rem",
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
            }}>📑 User Task Grid </Typography>
        
            <DataGrid
                rows={tasks}
                columns={columns}
                getRowId={(row) => row.id} // ✅ Ensure unique ID
                pageSize={10}
                getRowClassName={(params) => {
                    const priority = params.row.priority || "";
                    return `priority-${priority.toLowerCase()}`;
                }}
                sx={{
                    height: "100%",
                    width: "100%",
                    overflow: "auto",
                    "& .priority-high": { backgroundColor: "#ffebee" }, // Light Red
                    "& .priority-medium": { backgroundColor: "#fff3e0" }, // Light Orange
                    "& .priority-low": { backgroundColor: "#e8f5e9" }, // Light Green
                }}
            />
        </Box>
    );
};

export default TasksGrid;
