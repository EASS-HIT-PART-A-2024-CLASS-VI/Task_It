import React from "react";
import { Box, Typography } from "@mui/material";

const Kanban = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Kanban
            </Typography>
            <Typography variant="body1">
                This is the Kanban view where you can manage your tasks.
            </Typography>
            {/* TODO: Add your Kanban board implementation here */}
        </Box>
    );
};

export default Kanban;
