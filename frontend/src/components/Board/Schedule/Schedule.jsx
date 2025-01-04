import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

function Schedule() {
    return (
        <div>
            <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" />
        </div>
    );
}

export default Schedule;
