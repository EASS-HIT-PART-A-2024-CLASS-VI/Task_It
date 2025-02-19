import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, Typography, Box, Grid, CircularProgress, Paper, Divider } from "@mui/material";
import { motion } from "framer-motion"; // ✅ Adds smooth animations
import Chart from "chart.js/auto";
import "./Dashboard.css";

const Dashboard = () => {
    const [boards, setBoards] = useState([]);
    const [boardStats, setBoardStats] = useState({});
    const [loading, setLoading] = useState(true);
    const username = JSON.parse(localStorage.getItem("user") || "{}").username || "User";

    useEffect(() => {
        const fetchBoards = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await fetch("http://localhost:8000/api/groups/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                setBoards(data);
            } catch (error) {
                console.error("Error fetching boards:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBoards();
    }, []);

    useEffect(() => {
        const fetchBoardStats = async () => {
            const token = localStorage.getItem("token");
            if (!token || boards.length === 0) return;

            const stats = {};
            for (const board of boards) {
                try {
                    const response = await fetch(`http://localhost:8000/api/tasks/?board_id=${board.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const tasks = await response.json();

                    // ✅ Ensure all statuses are included
                    const allStatuses = ["Not Started", "Working on It", "Done"];
                    const statusCounts = allStatuses.reduce((acc, status) => {
                        acc[status] = tasks.filter((task) => task.status === status).length;
                        return acc;
                    }, {});

                    stats[board.id] = statusCounts;
                } catch (error) {
                    console.error(`Error fetching tasks for board ${board.id}:`, error);
                }
            }
            setBoardStats(stats);
        };

        if (boards.length > 0) {
            fetchBoardStats();
        }
    }, [boards]);

    return (
        <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            {/* Sidebar Placeholder */}
            <Box sx={{ width: 250, flexShrink: 0 }} />

            {/* Scrollable Dashboard Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    padding: 3,
                    overflowY: "auto", // ✅ Enables vertical scrolling
                    height: "100vh",
                }}
            >
                {/* Animated Welcome Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Typography variant="h4" gutterBottom sx={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}>
                        Welcome to {username}'s Dashboard
                    </Typography>
                </motion.div>

                <Divider sx={{ mb: 3, bgcolor: "#fff" }} />

                {/* Loading State */}
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                        <CircularProgress color="inherit" />
                    </Box>
                ) : (
                    <Grid container spacing={3} justifyContent="center">
                        {boards.length > 0 ? (
                            boards.map((board, index) => (
                                <Grid item key={board.id} xs={12} sm={6} md={4}>
                                    {/* Motion Card for Interaction */}
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card sx={{ padding: 2, bgcolor: "#fff", boxShadow: 5, minHeight: 250 }}>
                                            <CardContent>
                                                <Typography
                                                    variant="h6"
                                                    sx={{ fontWeight: "bold", color: "#333", textAlign: "center" }}
                                                >
                                                    {board.name}
                                                </Typography>
                                                {boardStats[board.id] ? (
                                                    <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Bar
    data={{
        labels: ["Not Started", "Working on It", "Done"],
        datasets: [
            {
                label: "Task Status",
                data: [
                    boardStats[board.id]["Not Started"],
                    boardStats[board.id]["Working on It"],
                    boardStats[board.id]["Done"],
                ],
                backgroundColor: ["#ff6384", "#ffcd56", "#36a2eb"],
            },
        ],
    }}
    options={{
        responsive: true,
        maintainAspectRatio: false, // ✅ Prevents chart stretching
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0, // ✅ Removes decimal points
                    callback: (value) => Math.round(value), // ✅ Ensures integer values
                },
            },
        },
    }}
/>
                                                    </Box>
                                                ) : (
                                                    <Typography textAlign="center" sx={{ color: "#666" }}>
                                                        No task data available.
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="h6" textAlign="center" color="#fff">
                                No boards registered.
                            </Typography>
                        )}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default Dashboard;
