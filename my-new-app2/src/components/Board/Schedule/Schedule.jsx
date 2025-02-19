import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
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
        <div style={{ width: "80vh", height: "100vh", padding: "20px", backgroundColor: "white" }}>
            <h2 style={{ color: "#000" }}>Task Schedule</h2> {/* ✅ Title in Black */}
            {loading ? (
                <p style={{ color: "#000" }}>Loading tasks...</p>
            ) : (
                <FullCalendar 
                    plugins={[dayGridPlugin]} 
                    initialView="dayGridMonth" 
                    events={events} 
                    height="90vh"
                    eventContent={(eventInfo) => (
                        <div style={{
                            padding: "5px",
                            backgroundColor: eventInfo.event.backgroundColor,
                            borderRadius: "5px",
                            fontSize: "12px",
                            color: "#000",  // ✅ Set text to black
                            textAlign: "left"
                        }}>
                            <strong>{eventInfo.event.title}</strong> <br />
                            <span>📅 {eventInfo.event.extendedProps.deadline}</span> <br />
                            <span>👤 {eventInfo.event.extendedProps.assigned_to}</span>
                        </div>
                    )}
                    eventClick={(info) => {
                        alert(`Task: ${info.event.title}\nPriority: ${info.event.extendedProps.priority}\nDeadline: ${info.event.extendedProps.deadline}\n\nAssigned To: ${info.event.extendedProps.assigned_to}\n\nDescription: ${info.event.extendedProps.description}`);
                    }}
                />
            )}
        </div>
    );
};

export default Schedule;
