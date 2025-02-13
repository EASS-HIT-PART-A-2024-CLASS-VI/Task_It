import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const Schedule = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/tasks/");
                if (!response.ok) {
                    throw new Error("Failed to fetch tasks");
                }
                const tasks = await response.json();

                // Convert tasks into FullCalendar event objects
                const formattedEvents = tasks
                    .filter(task => task.deadline) // ✅ Only include tasks with deadlines
                    .map(task => ({
                        title: task.title,
                        start: task.deadline, // ✅ Deadline as event date
                        extendedProps: {
                            description: task.description || "No description",
                            priority: task.priority,
                        },
                    }));

                setEvents(formattedEvents);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();
    }, []);

    return (
        <div style={{ padding: "20px", backgroundColor: "white", borderRadius: "10px" }}>
            <h2>Task Schedule</h2>
            <FullCalendar 
                plugins={[dayGridPlugin]} 
                initialView="dayGridMonth" 
                events={events} 
                height="80vh"
                eventClick={(info) => {
                    alert(`Task: ${info.event.title}\nPriority: ${info.event.extendedProps.priority}\n\nDescription: ${info.event.extendedProps.description}`);
                }}
            />
        </div>
    );
};

export default Schedule;
