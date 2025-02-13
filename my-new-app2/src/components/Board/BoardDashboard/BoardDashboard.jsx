import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const BoardDashboard = () => {
    const [stats, setStats] = useState({ total: 0, notStarted: 0, workingOnIt: 0, done: 0 });
    const [selectedMetric, setSelectedMetric] = useState("total");

    useEffect(() => {
        const fetchTaskStats = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/tasks/dashboard");
                if (!response.ok) throw new Error("Failed to fetch task statistics");
                const data = await response.json();
                setStats({
                    total: data.total || 0,
                    notStarted: data.not_started || 0,
                    workingOnIt: data.working_on_it || 0,
                    done: data.done || 0,
                });
            } catch (error) {
                console.error("Error fetching statistics:", error);
            }
        };

        fetchTaskStats();
    }, []);

    const data = {
        labels: ["Total Tasks", "Not Started", "In Progress", "Completed"],
        datasets: [
            {
                label: "Task Status",
                data: [stats.total, stats.notStarted, stats.workingOnIt, stats.done],
                backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4CAF50"],
            },
        ],
    };

    return (
        <Box sx={{ padding: 3, backgroundColor: "background.default", minHeight: "100vh" }}>
            <Typography variant="h4" gutterBottom color="primary">
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ padding: 3, textAlign: "center", height: "100%" }}>
                        <Typography variant="h6">Task Overview</Typography>

                        <FormControl sx={{ marginTop: 2, width: "100%" }}>
                            <InputLabel>View Metric</InputLabel>
                            <Select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
                                <MenuItem value="total">Total Tasks</MenuItem>
                                <MenuItem value="notStarted">Not Started</MenuItem>
                                <MenuItem value="workingOnIt">In Progress</MenuItem>
                                <MenuItem value="done">Completed</MenuItem>
                            </Select>
                        </FormControl>

                        <Typography variant="h5" sx={{ marginTop: 2 }}>
                            {selectedMetric === "total" && `Total Tasks: ${stats.total}`}
                            {selectedMetric === "notStarted" && `Not Started: ${stats.notStarted}`}
                            {selectedMetric === "workingOnIt" && `In Progress: ${stats.workingOnIt}`}
                            {selectedMetric === "done" && `Completed: ${stats.done}`}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography variant="h6" textAlign="center" gutterBottom>
                            Task Distribution
                        </Typography>
                        <Bar data={data} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BoardDashboard;
