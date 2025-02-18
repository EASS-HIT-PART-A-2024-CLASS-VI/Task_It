import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { useParams } from "react-router-dom";

const BoardDashboard = () => {
    const { boardId } = useParams();
    const [stats, setStats] = useState({ total: 0, status_counts: {}, priority_counts: {} });
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [priorityBreakdown, setPriorityBreakdown] = useState({});
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchBoardData = async () => {
            if (!boardId || !token) return;

            try {
                const response = await fetch(`http://localhost:8000/api/groups/${boardId}/dashboard`, {
                    headers: { "Authorization": `Bearer ${token}` ,
                    "Content-Type": "application/json"
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch board statistics");

                const data = await response.json();
                console.log("📌 Board Dashboard Data:", data);

                setStats(data);
                setAssignedTasks(data.assigned_tasks || []);
                setPriorityBreakdown(data.priority_breakdown || {});

            } catch (error) {
                console.error("Error fetching statistics:", error);
            }
        };

        fetchBoardData();
    }, [boardId]);

    return (
        <Box sx={{ padding: 3, backgroundColor: "background.default", minHeight: "100vh" }}>
            <Typography variant="h4" gutterBottom sx={{ color: "black" }}>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Task Overview */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
                        <Typography variant="h6">Task Overview</Typography>
                        <Typography>Total Tasks: {stats.total}</Typography>
                        <Typography>Not Started: {stats.status_counts.not_started}</Typography>
                        <Typography>In Progress: {stats.status_counts.working_on_it}</Typography>
                        <Typography>Completed: {stats.status_counts.done}</Typography>
                    </Paper>
                </Grid>

                {/* Bar Chart: Task Status */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography textAlign="center">Total Tasks by Status</Typography>
                        <Bar data={{
                            labels: ["Not Started", "In Progress", "Completed"],
                            datasets: [{
                                label: "Tasks",
                                data: Object.values(stats.status_counts),
                                backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
                            }]
                        }} />
                    </Paper>
                </Grid>

                {/* Pie Chart: Assigned Tasks */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography textAlign="center">Assigned Tasks by Priority</Typography>
                        <Pie data={{
                            labels: assignedTasks.map(user => user.name),
                            datasets: [{
                                data: assignedTasks.map(user => user.high + user.medium + user.low),
                                backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
                            }]
                        }} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BoardDashboard;
