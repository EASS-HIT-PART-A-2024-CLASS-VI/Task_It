import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Card, CardContent, Typography, Box, Divider } from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";

const UserSchedule = () => {
    const { boardId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const decodedToken = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = decodedToken.user_id;

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

                // ✅ Format tasks properly
                data = data
                    .filter(task => task.deadline) // ✅ Ensure only tasks with deadlines are included
                    .map((task, index) => ({
                        id: task.id,
                        title: task.title,
                        start: dayjs(task.deadline).format("YYYY-MM-DD"),
                        backgroundColor: getPriorityColor(task.priority),
                        borderColor: "#000",
                        extendedProps: {
                            board_Name: task.board_Name || "Unknown Board",
                            priority: task.priority,
                            assigned_to: task.assigned_to.length > 0
                                ? task.assigned_to.join(", ")
                                : "Unassigned",
                            deadline: task.deadline ? dayjs(task.deadline).format("DD-MM-YYYY") : "No Deadline",
                            description: task.description || "No description",
                            status: task.status || "No status",
                        }
                    }));

                setTasks(data);
            } catch (error) {
                console.error("❌ Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [userId]);

    // ✅ Define Priority Colors
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high": return "#ffcccb"; // Light Red
            case "medium": return "#ffeb99"; // Light Yellow
            case "low": return "#c8e6c9"; // Light Green
            default: return "#ffffff"; // Default White
        }
    };

    return (
        <Box sx={{ 
            width: "100%", 
            height: "90vh", 
            padding: "20px", 
            backgroundColor: "white", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center"
        }}>
            {/* 📌 Title with Icon */}
            <Typography 
                variant="h4" 
                sx={{ 
                    color: "#000", 
                    textAlign: "center", 
                    marginBottom: "1rem", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px" 
                }}
            >
                📅 User Task Schedule
            </Typography>
    
            {/* 📌 Full Width Divider */}
            <Divider sx={{ width: "90%", bgcolor: "#000", marginBottom: "1rem" }} />
    
            {/* 📌 Loading State */}
            {loading ? (
                <Typography sx={{ color: "#000", textAlign: "center" }}>Loading tasks...</Typography>
            ) : (
                <Box 
                    sx={{ 
                        width: "90%", 
                        maxWidth: "900px",  // ✅ Reduced max width
                        height: "auto", 
                        padding: "10px", 
                        boxShadow: "0px 2px 10px rgba(0,0,0,0.2)", 
                        borderRadius: "10px",
                        backgroundColor: "#f9f9f9" // ✅ Light background for better contrast
                    }}
                >
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        events={tasks}
                        height="75vh"  // ✅ Reduced height
                        contentHeight="auto"
                        eventContent={(eventInfo) => {
                            const task = eventInfo.event.extendedProps;
                            return (
                                <Box
                                    sx={{
                                        padding: "6px",  // ✅ Slightly smaller padding
                                        backgroundColor: eventInfo.event.backgroundColor || "#e0e0e0",
                                        borderRadius: "6px",  // ✅ Slightly smaller rounded corners
                                        boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                                        color: "#000",
                                        fontSize: "11px",  // ✅ Smaller font
                                        textAlign: "left",
                                        width: "100%",
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#000" }}>
                                        🎯 {eventInfo.event.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#000" }}>📅 {task.deadline || "No Deadline"}</Typography>
                                    <Typography variant="body2" sx={{ color: "#000" }}>📌 {task.board_Name || "Unknown Board"}</Typography>
                                    <Typography variant="body2" sx={{ color: "#000" }}>📜 {task.status || "No Status"}</Typography>
                                </Box>
                            );
                        }}
                        eventClick={(info) => {
                            const task = info.event.extendedProps;
                            alert(`📌 Task: ${info.event.title}
                            🛠️ Priority: ${task.priority}
                            📅 Deadline: ${task.deadline || "No Deadline"}
                            📌 Board: ${task.board_Name || "Unknown Board"}
                            📜 Description: ${task.status || "No Description"}`);
                        }}
                    />
                </Box>
            )}
        </Box>
    );
    
};

export default UserSchedule;
