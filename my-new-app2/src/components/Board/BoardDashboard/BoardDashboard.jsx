import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { useParams } from "react-router-dom";

const BoardDashboard = () => {
    const { boardId } = useParams();
    const [stats, setStats] = useState({ total: 0, status_counts: {}, priority_counts: {} });
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchBoardData = async () => {
            if (!boardId || !token) return;
            try {
                const response = await fetch(`http://localhost:8000/api/groups/${boardId}/dashboard`, {
                    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                });
                if (!response.ok) throw new Error("Failed to fetch board statistics");
                const data = await response.json();
                console.log("📌 Board Dashboard Data:", data);
                setStats(data);
            } catch (error) {
                console.error("Error fetching statistics:", error);
            }
        };
        fetchBoardData();
    }, [boardId]);

    return (
        <Box sx={{ padding: 2, backgroundColor: "background.default", minHeight: "100vh" }}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: "center", color: "black" }}>
                Dashboard
            </Typography>
            
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 2, textAlign: "center" }}>
                <Typography variant="h6">Task Overview</Typography>
                <Typography>Total: {stats.total}</Typography>
                <Typography>Not Started: {stats.status_counts.not_started || 0}</Typography>
                <Typography>In Progress: {stats.status_counts.working_on_it || 0}</Typography>
                <Typography>Completed: {stats.status_counts.done || 0}</Typography>
            </Paper>
            
            {/* Task Status Bar Chart */}
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                <Typography textAlign="center">Tasks by Status</Typography>
                <Bar data={{
                    labels: ["Not Started", "In Progress", "Completed"],
                    datasets: [{
                        label: "Tasks",
                        data: [
                            stats.status_counts.not_started || 0,
                            stats.status_counts.working_on_it || 0,
                            stats.status_counts.done || 0,
                        ],
                        backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
                    }]
                }} />
            </Paper>
            
            {/* Priority Breakdown Bar Chart */}
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                <Typography textAlign="center">Tasks by Priority</Typography>
                <Bar data={{
                    labels: ["High", "Medium", "Low"],
                    datasets: [{
                        label: "Tasks",
                        data: [
                            stats.priority_counts.high || 0,
                            stats.priority_counts.medium || 0,
                            stats.priority_counts.low || 0,
                        ],
                        backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
                    }]
                }} />
            </Paper>
            
            {/* Assigned Tasks Pie Chart */}
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                <Typography textAlign="center">Assigned Tasks by Priority</Typography>
                <Pie data={{
                    labels: Object.keys(stats.priority_counts),
                    datasets: [{
                        data: Object.values(stats.priority_counts),
                        backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
                    }]
                }} />
            </Paper>
        </Box>
    );
};

export default BoardDashboard;