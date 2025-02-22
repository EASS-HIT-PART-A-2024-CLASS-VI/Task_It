import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, Typography, Box, Grid, CircularProgress, Divider } from "@mui/material";
import { motion } from "framer-motion"; 
import { BsRobot } from "react-icons/bs";
import "./Dashboard.css";

const Dashboard = () => {
    const [boards, setBoards] = useState([]);
    const [boardStats, setBoardStats] = useState({});
    const [loading, setLoading] = useState(true);
    const username = JSON.parse(localStorage.getItem("user") || "{}").username || "User";
    const [chatOpen, setChatOpen] = useState(false);

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
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "100vw",  // ✅ Full width of the viewport
                minHeight: "100vh",
                padding: 3,
                background: "linear-gradient(135deg, #34c2b9cf 0%, #008ba0 100%)",
            }}
        >
        {/* 📌 Static Title - Centered with Adjustable Position */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
                position: "relative",
                left: "10%", // ✅ Adjust this value to move left/right
                width: "100%",
                textAlign: "center",
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    color: "#fff",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                }}
            >
                Welcome to {username}'s Dashboard
            </Typography>
        </motion.div>

        {/* 📌 Static Line Below Title - Adjustable Width */}
        <Divider
            sx={{
                width: "80%", // ✅ Adjust this value to control the width
                maxWidth: "600px", // ✅ Prevents it from getting too large on big screens
                bgcolor: "#fff",
                height: "2px",
                margin: "0 auto", // ✅ Centers the line horizontally
                marginBottom: "2rem",
                marginRight: "22%", // ✅ Adjust this value to move left/right
            }}
        />

            {/* 📌 Boards Container - Stays in Row */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    gap: 3,
                    width: "85%",
                    marginLeft: "18%", // ✅ Adjust this value to move left/right
                    marginRight: "auto",
                    marginBottom: 3,
                }}
            >
                {boards.length > 0 ? (
                    boards.map((board) => (
                        <motion.div
                            key={board.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card sx={{ width: 350, padding: 2, bgcolor: "#fff", boxShadow: 5, minHeight: 250,borderRadius: 6 }}>
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
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { display: false },
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            ticks: {
                                                                precision: 0,
                                                                callback: (value) => Math.round(value),
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
                    ))
                ) : (
            <Typography variant="h6" textAlign="center" color="#fff">
                No boards registered.
            </Typography>
        )}
    </Box>  
</Box>
    
    );
    
};

export default Dashboard;
