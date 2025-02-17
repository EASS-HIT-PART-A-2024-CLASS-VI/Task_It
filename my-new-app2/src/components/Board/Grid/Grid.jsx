import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom"; // ✅ Get boardId from URL
import dayjs from "dayjs"; // ✅ Used for date formatting

const GridView = () => {
    const { boardId } = useParams(); // ✅ Get boardId from URL
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem("token");
            if (!boardId || !token) return;
    
            try {
                const response = await fetch(`http://localhost:8000/api/tasks/?board_id=${boardId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch tasks");
    
                let data = await response.json();
    
                // ✅ Format deadlines & add row number
                data = data.map((task, index) => ({
                    ...task,
                    number: index + 1,
                    deadline: task.deadline ? dayjs(task.deadline).format("DD-MM-YYYY") : "No Deadline",
                }));
    
                // ✅ Ensure tasks only update when users are available
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };
    
        if (Object.keys(users).length > 0) {
            fetchTasks(); // ✅ Fetch tasks only after users are loaded
        }
    }, [boardId, users]); // ✅ Fetch tasks after users are updated
    

    // ✅ Fetch User Names from API
    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch("http://localhost:8000/api/users/", {
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!response.ok) throw new Error("Failed to fetch users");

                const data = await response.json();
                const userMap = {};
                data.forEach(user => {
                    userMap[user.id] = user.name; // ✅ Store ID → Name
                });

                setUsers(userMap);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    // ✅ Define Priority Colors
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high": return "#ffebee"; // Light Red
            case "medium": return "#fff3e0"; // Light Orange
            case "low": return "#e8f5e9"; // Light Green
            default: return "#ffffff"; // White
        }
    };

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
            valueGetter: (params) => {
                if (!params.row || !Array.isArray(params.row.assigned_to) || params.row.assigned_to.length === 0) {
                    return "Unassigned"; // ✅ Handle missing or empty field
                }
        
                return params.row.assigned_to
                    .map(userId => users[userId] || "Loading...") // ✅ Show "Loading..." until users are fetched
                    .join(", ");
            },
        },
        
            
        { field: "deadline", headerName: "Deadline", width: 150 },
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
                        getRowId={(row) => row.number} // ✅ Use row number instead of ID
                        getRowClassName={(params) => {
                            const priority = params.row.priority || "";
                            return `priority-${priority.toLowerCase()}`;
                        }}
                        sx={{
                            height: "100%",
                            maxHeight: "100%",
                            overflow: "auto",
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
