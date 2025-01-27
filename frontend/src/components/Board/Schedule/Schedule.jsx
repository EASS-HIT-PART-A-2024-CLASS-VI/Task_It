import React from "react";
import { Box, Typography } from "@mui/material";

const Schedule = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Schedule
            </Typography>
            <Typography variant="body1">
                This is the schedule view where you can plan and view your tasks on a calendar.
            </Typography>
            {/* TODO: Add your calendar or schedule implementation here */}
        </Box>
    );
};

export default Schedule;
