import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const BoardDashboard = ({ tasks }) => {
    const emptyData = [{ name: "No Tasks", value: 1 }];
    const COLORS = ["#8884d8"];

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            {tasks.length === 0 ? (
                <Paper sx={{ padding: 3, textAlign: "center" }}>
                    <Typography variant="h6" color="textSecondary">
                        No tasks found for this board.
                    </Typography>
                    <Box sx={{ width: "100%", height: 300, marginTop: 2 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={emptyData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                >
                                    {emptyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            ) : (
                <Typography variant="body1">Render real data pie chart here...</Typography>
            )}
        </Box>
    );
};

export default BoardDashboard;
