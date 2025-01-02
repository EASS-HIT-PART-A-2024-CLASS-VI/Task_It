import React from "react";
import FullCalendar from "@fullcalendar/react"; // FullCalendar Component
import dayGridPlugin from "@fullcalendar/daygrid"; // DayGrid Plugin
import "./Schedule.css";

function Schedule({ events }) {
    return (
        <div className="schedule-container">
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
            />
        </div>
    );
}

export default Schedule;
