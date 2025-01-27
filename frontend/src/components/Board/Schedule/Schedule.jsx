import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

function Schedule({ tasks }) {
    const events = tasks.map((task) => ({
        title: task.title,
        start: task.startDate,
        end: task.dueDate,
    }));

    return (
        <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
        />
    );
}
export default Schedule;