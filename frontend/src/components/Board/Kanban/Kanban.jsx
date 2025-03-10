import React, { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Paper, Grid, IconButton, Modal, TextField, Button, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams } from "react-router-dom";
import TaskEditor from "../TaskEditor/TaskEditor";

const Kanban = () => {
    const { boardId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openEditor, setOpenEditor] = useState(false);
    const [openTaskModal, setOpenTaskModal] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const token = localStorage.getItem("token") || "";
    if (!token) {
        window.location.href = "/login";
    }

    const fetchTasks = useCallback(async () => {
        if (!boardId || !token) return;
    
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/api/tasks/?board_id=${boardId}`, {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
    
            if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.statusText}`);
            const data = await response.json();
            console.log("📌 API Response (Tasks Fetched):", data); // ✅ Debugging log
            // ✅ Ensure deadline is properly formatted when retrieving
            const formattedTasks = data.map(task => ({
                ...task,
                deadline: task.deadline ? task.deadline.split('T')[0] : "",  // ✅ Extracts `YYYY-MM-DD`
            }));
    
            setTasks(formattedTasks);
            console.log("✅ Tasks fetched with deadlines:", formattedTasks); // Debugging
        } catch (error) {
            console.error("❌ Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    }, [boardId, token]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // ✅ Listen for task refresh event from `localStorage`
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "refreshTasks") {
                console.log("📌 Detected task refresh event. Reloading tasks...");
                fetchTasks(); // Call the existing function to reload tasks
            }
        };
    
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);    

    // Function to get priority color
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return '#ffebee'; // Light red
            case 'medium':
                return '#fff3e0'; // Light orange
            case 'low':
                return '#e8f5e9'; // Light green
            default:
                return '#ffffff'; // White
        }
    };

    // Function to create a new task
    const handleTaskCreate = async () => {
        if (!newTaskTitle.trim()) {
            alert("Task title cannot be empty!");
            return;
        }
    
        const newTask = {
            title: newTaskTitle,
            description: newTaskDescription,
            status: "Not Started",
            priority: "Medium",
            board_id: boardId,
            deadline: null
        };
    
        try {
            const response = await fetch(`http://localhost:8000/api/tasks/`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newTask),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create task: ${errorText}`);
            }
    
            setOpenTaskModal(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
            await fetchTasks();
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };
    
    // Function to update task status
    const handleDragEnd = async (result) => {
        if (!result.destination) return;
    
        const { draggableId, destination } = result;
        const newStatus = destination.droppableId;
    
        try {
            const response = await fetch(`http://localhost:8000/api/tasks/${draggableId}`, {
                method: "PATCH",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus }),
            });
    
            if (!response.ok) throw new Error("Failed to update task status");
            await fetchTasks();
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // Function to update a task by ID
    const handleTaskUpdate = async (updatedTaskData) => {
        try {
            const formattedDeadline = updatedTaskData.deadline
                ? new Date(updatedTaskData.deadline).toISOString().split('T')[0]  // Ensure `YYYY-MM-DD`
                : null;
    
            const updatePayload = { 
                ...updatedTaskData,
                deadline: formattedDeadline  // Ensure correct format before sending
            };
    
            console.log("📌 Sending PATCH Request:", JSON.stringify(updatePayload, null, 2));
    
            const response = await fetch(`http://localhost:8000/api/tasks/${updatedTaskData.id}`, {
                method: "PATCH",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatePayload),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update task: ${errorText}`);
            }
    
            console.log("✅ Task updated successfully!");
            await fetchTasks(); // Refresh the UI
            setOpenEditor(false);
        } catch (error) {
            console.error("❌ Error updating task:", error);
            alert("Failed to update task. Please try again.");
        }
    };

    // Function to delete a task by ID
    const deleteTask = async (taskId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) throw new Error("Failed to delete task");
            
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            console.log(`Task with ID ${taskId} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    return (
        <Box sx={{ width: "100%", height: "90vh", padding: "20px", display: "flex", 
            flexDirection:"column",alignItems:"center",justifyContent:"center",
            marginRight:"-20%" }}>
            <Typography variant="h4"sx={{
                    color:"#000",
                    textAlign:"center",
                    marginTop:"-8rem",
                    marginBottom:"1rem",
                    display:"flex",
                    alignItems:"center",
                    gap: "10px",
                    marginRight:"0%"

                }}>📝 Kanban Board</Typography>
             <Divider sx={{ width: "90%", bgcolor:"#000", marginBottom:"1rem",marginRight:"0%" }} />
             {/* 📅 Kanban Component */}
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpenTaskModal(true)}
                sx={{ mb: 2 }}
            >
                <AddIcon sx={{ marginRight: 1 }} /> Add Task
            </Button>

            {/* Create Task Modal */}
            <Modal 
                open={openTaskModal} 
                onClose={() => setOpenTaskModal(false)}
                aria-labelledby="create-task-modal"
            >
                <Box sx={{ 
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 1
                }}>
                    <Typography variant="h6" mb={2}>Create a New Task</Typography>
                    <TextField
                        fullWidth
                        label="Task Title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        onClick={handleTaskCreate}
                    >
                        Create Task
                    </Button>
                </Box>
            </Modal>

            {/* Task Editor Modal */}
            <Modal
                open={openEditor}
                onClose={() => setOpenEditor(false)}
                aria-labelledby="task-editor-modal"
            >
                <Box sx={{ 
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90%",
                    maxWidth: 600,
                    maxHeight: "90vh",
                    overflow: "auto"
                }}>
                    {selectedTask && (
                        <TaskEditor
                            key={refreshKey}
                            task={selectedTask}
                            onClose={() => setOpenEditor(false)}
                            onUpdate={handleTaskUpdate}
                            token={token}
                        />
                    )}
                </Box>
            </Modal>

            {loading && <Typography>Loading tasks...</Typography>}
            
            <DragDropContext onDragEnd={handleDragEnd}>
                <Grid container spacing={10}>
                    {["Not Started", "Working on It", "Done"].map((status) => (
                        <Grid item xs={12} md={4} key={status}>
                            <Paper 
                                sx={{ 
                                    padding: 2, 
                                    minHeight: "500px",
                                    width: "280px",
                                    flexGrow: 1,
                                    borderRadius: 6,
                                    backgroundColor: "background.default" 
                                }}
                            >
                                <Typography variant="h4" sx={{ mb: 2,textAlign:"center" }}>
                                    {status}
                                </Typography>
                                <Droppable droppableId={status}>
                                    {(provided) => (
                                        <Box 
                                            ref={provided.innerRef} 
                                            {...provided.droppableProps}
                                            sx={{ minHeight: "100px" }}
                                        >
                                            {tasks
                                                .filter((task) => task.status === status)
                                                .map((task, index) => (
                                                <Draggable 
                                                    key={task.id} 
                                                    draggableId={task.id} 
                                                    index={index}
                                                >   
                                                    {(provided) => (
                                                        <Paper
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            sx={{
                                                                p: 2,
                                                                mb: 1,
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                backgroundColor: getPriorityColor(task.priority),
                                                                '&:hover': {
                                                                    opacity: 0.9,
                                                                    transform: 'scale(1.02)',
                                                                    transition: 'all 0.2s'
                                                                }
                                                            }}
                                                            onClick={() => {
                                                                setSelectedTask(task);
                                                                setOpenEditor(true);
                                                            }}
                                                        >
                                                            <Box>
                                                                <Typography variant="subtitle1">
                                                                    {task.title}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    Priority: {task.priority}
                                                                </Typography>
                                                            </Box>
                                                            {status === "Done" && (
                                                                <CheckCircleIcon 
                                                                    color="success" 
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            )}
                                                            <IconButton
                                                                aria-label="delete"
                                                                onClick={(event) => {
                                                                    event.stopPropagation(); // ✅ Prevents opening Task Editor
                                                                    deleteTask(task.id);
                                                                }}
                                                                size="small"
                                                                sx={{ color: "red" }}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Paper>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </Box>
                                    )}
                                </Droppable>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </DragDropContext>
        </Box>
    );
};

export default Kanban;