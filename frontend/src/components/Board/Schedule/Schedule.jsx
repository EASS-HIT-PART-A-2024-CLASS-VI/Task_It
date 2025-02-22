import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid/index.js";
import {  Typography, Box, Divider } from "@mui/material";
import { useParams } from "react-router-dom"; // ✅ Get boardId from URL
import dayjs from "dayjs"; // ✅ Import for date formatting

const Schedule = () => {
    const { boardId } = useParams(); // ✅ Get boardId from URL
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem("token");
            if (!boardId || !token) return; // ✅ Ensure boardId and token exist

            try {
                const response = await fetch(`http://localhost:8000/api/tasks/?board_id=${boardId}`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!response.ok) throw new Error("Failed to fetch tasks");

                const tasks = await response.json();
                console.log("✅ Tasks fetched:", tasks);

                // ✅ Convert tasks into FullCalendar event objects
                const formattedEvents = tasks
                    .filter(task => task.deadline) // ✅ Only include tasks with deadlines
                    .map(task => ({
                        id: task.id,
                        title: task.title,
                        start: dayjs(task.deadline).format("YYYY-MM-DD"), // ✅ Ensure correct date format
                        backgroundColor: getPriorityColor(task.priority), // ✅ Color by priority
                        borderColor: "#000000", // ✅ Black border for contrast
                        extendedProps: {
                            description: task.description || "No description",
                            priority: task.priority,
                            assigned_to: task.assigned_to.length > 0 ? task.assigned_to : "Unassigned",
                            deadline: dayjs(task.deadline).format("DD-MM-YYYY"),
                        },
                    }));

                setEvents(formattedEvents);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [boardId, users]); // ✅ Runs when boardId or users update

    // ✅ Define Priority Colors
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high": return "#ffcccb"; // Light Red
            case "medium": return "#ffeb99"; // Light Yellow
            case "low": return "#c8e6c9"; // Light Green
            default: return "#ffffff"; // White
        }
    };

    return (
        <Box sx={{ width: "100%", height: "90vh", padding: "20px", display: "flex", 
        flexDirection:"column",alignItems:"center",justifyContent:"center",
        marginRight:"-20%" }}>
            {/* 📌 Title with Icon */}
            <Typography
                variant="h4"
                sx={{
                    color:"#000",
                    textAlign:"center",
                    marginBottom:"1rem",
                    display:"flex",
                    alignItems:"center",
                    gap: "10px",
                    marginRight:"0%"

                }}
            >
                📅 User Task Schedule
            </Typography>
            <Divider sx={{ width: "90%", bgcolor:"#000", marginBottom:"1rem",marginRight:"0%" }} />
            {/* 📅 Calendar Component */}
            {loading ? (
                <Typography sx={{ color: "#000", textAlign: "center" }}>Loading tasks...</Typography>
            ) : (
            <Box sx={{ width: "90%", maxWidth: "900px", 
                height:"auto",
                padding:"10px",
                boxShadow:"0px 2px 10px rgba(0,0,0,0.2)",
                borderRadius:"10px",
                backgroundColor:"#f9f9f9", // ✅ Light gray background
                marginRight:"0%" // ✅ Adjusted margin
             }}>
                <FullCalendar 
                    plugins={[dayGridPlugin]} 
                    initialView="dayGridMonth" 
                    events={events} 
                    height="75vh"
                    contentHeight="auto"
                    eventContent={(eventInfo) => {
                        const assignedUsers = Array.isArray(eventInfo.event.extendedProps.assigned_to)
                            ? eventInfo.event.extendedProps.assigned_to.join(" | ")
                            : "Unassigned";  // ✅ Join usernames into a string
                    
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
                                    marginRight: "-20%" // ✅ Adjusted margin
                                }}
                            >
                                <Typography variant="subtitle2" component="div">
                                    🎯{eventInfo.event.title}
                                </Typography>
                                <Typography variant="body2" component="div">
                                    📅 {eventInfo.event.extendedProps.deadline}
                                </Typography>
                                <Typography variant="body2" component="div">
                                    👤 {assignedUsers}
                                </Typography>
                            </Box>
                        );
                    }}
                    
                    eventClick={(info) => {
                        alert(`Task: ${info.event.title}\nPriority: ${info.event.extendedProps.priority}\nDeadline: ${info.event.extendedProps.deadline}\n\nAssigned To: ${info.event.extendedProps.assigned_to}\n\nDescription: ${info.event.extendedProps.description}`);
                    }}
                />
            </Box>
            )}
        </Box>
    );
};

export default Schedule;
