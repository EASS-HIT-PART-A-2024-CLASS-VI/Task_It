import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const BoardDashboard = ({ tasks }) => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
                <Typography variant="h6">
                    Welcome to the Dashboard. Here you can see an overview of your tasks.
                </Typography>
                {tasks && tasks.length > 0 ? (
                    <Typography variant="body1">{tasks.length} tasks available.</Typography>
                ) : (
                    <Typography variant="body1" color="textSecondary">
                        No tasks available yet.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default BoardDashboard;
